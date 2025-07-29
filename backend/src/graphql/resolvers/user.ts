import { PrismaClient } from '@prisma/client';

type Context = {
  prisma: PrismaClient;
  user?: any;
};

const Query = {
  me: async (_parent: any, _args: any, context: Context) => {
    if (!context.user) return null;
    return context.prisma.user.findUnique({
      where: { id: context.user.id },
    });
  },
  users: async (_parent: any, _args: any, context: Context) => {
    return context.prisma.user.findMany();
  },
};

const Mutation = {
  updateUserProfile: async (
    _parent: unknown,
    args: { name?: string; email?: string; avatarUrl?: string },
    context: Context
  ) => {
    if (!context.user) throw new Error("Not authenticated");

    return context.prisma.user.update({
      where: { id: context.user.id },
      data: {
        ...(args.name && { name: args.name }),
        ...(args.email && { email: args.email }),
        ...(args.avatarUrl && { avatarUrl: args.avatarUrl }),
      },
    });
  },

  deleteAccount: async (_parent: unknown, _args: {}, context: Context) => {
    if (!context.user) throw new Error("Not authenticated");

    const userId = context.user.id;

    // Step 1: Delete feedbacks on other prompts by this user
    await context.prisma.feedback.deleteMany({
      where: { userId },
    });

    // Step 2: Delete prompts and cascade their feedbacks
    const userPrompts = await context.prisma.prompt.findMany({
      where: { authorId: userId },
      select: { id: true },
    });

    const promptIds = userPrompts.map((p: { id: string }) => p.id);

    // Delete feedbacks on the user's prompts
    await context.prisma.feedback.deleteMany({
      where: { promptId: { in: promptIds } },
    });

    // Delete the prompts
    await context.prisma.prompt.deleteMany({
      where: { authorId: userId },
    });

    // Step 3: Delete the user
    await context.prisma.user.delete({
      where: { id: userId },
    });

    return true;
  },
};


const User = {
  prompts: async (parent: any, _args: any, context: Context) => {
    return context.prisma.prompt.findMany({ where: { authorId: parent.id } });
  },
  feedbacks: async (parent: any, _args: any, context: Context) => {
    return context.prisma.feedback.findMany({ where: { userId: parent.id } });
  },
};

export default {
  Query,
  Mutation,
  User,
};
