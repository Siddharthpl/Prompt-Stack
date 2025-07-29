import { PrismaClient } from '@prisma/client';

type Context = {
  prisma: PrismaClient;
  user?: any;
};

const Query = {
  feedbacks: async (_parent: any, args: { promptId: string }, context: Context) => {
    return context.prisma.feedback.findMany({
      where: { promptId: args.promptId },
      include: { user: true, prompt: true },
      orderBy: { createdAt: 'desc' },
    });
  },
};

const Mutation = {
  createFeedback: async (
    _parent: any,
    args: { promptId: string; comment: string; rating: number },
    context: Context
  ) => {
    if (!context.user) throw new Error('Not authenticated');
    // Prevent duplicate feedback on the same prompt by the same user, if desired
    const existing = await context.prisma.feedback.findFirst({
      where: { promptId: args.promptId, userId: context.user.id },
    });
    if (existing) throw new Error('Feedback already submitted for this prompt.');

    // Optionally validate rating (e.g., 1-5)
    if (args.rating < 1 || args.rating > 5) throw new Error('Rating must be between 1 and 5.');

    return context.prisma.feedback.create({
      data: {
        promptId: args.promptId,
        userId: context.user.id,
        comment: args.comment,
        rating: args.rating,
      },
      include: { user: true, prompt: true },
    });
  },
  deleteFeedback: async (_parent: any, args: { id: string }, context: Context) => {
    if (!context.user) throw new Error('Not authenticated');
    // Allow delete only if feedback is by the user
    const feedback = await context.prisma.feedback.findUnique({ where: { id: args.id } });
    if (!feedback || feedback.userId !== context.user.id) throw new Error('Unauthorized');
    await context.prisma.feedback.delete({ where: { id: args.id } });
    return true;
  },
};

const Feedback = {
  user: (parent: any, _args: any, context: Context) =>
    context.prisma.user.findUnique({ where: { id: parent.userId } }),
  prompt: (parent: any, _args: any, context: Context) =>
    context.prisma.prompt.findUnique({ where: { id: parent.promptId } }),
};

export default {
  Query,
  Mutation,
  Feedback,
};