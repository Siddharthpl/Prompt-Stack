import { PrismaClient } from '@prisma/client';

type Context = {
  prisma: PrismaClient;
  user?: any;
};

const Query = {
  prompt: async (_parent: any, args: { id: string }, context: Context) => {
    return context.prisma.prompt.findUnique({
      where: { id: args.id },
      include: { author: true, feedbacks: true },
    });
  },
  prompts: async (
    _parent: any,
    args: { search?: string; tags?: string[]; authorId?: string; isPublic?: boolean; skip?: number; take?: number },
    context: Context
  ) => {
    const { search, tags, authorId, isPublic, skip = 0, take = 10 } = args;
    return context.prisma.prompt.findMany({
      where: {
        AND: [
          search
            ? {
                OR: [
                  { title: { contains: search, mode: 'insensitive' } },
                  { content: { contains: search, mode: 'insensitive' } },
                ],
              }
            : {},
          tags && tags.length > 0 ? { tags: { hasSome: tags } } : {},
          authorId ? { authorId } : {},
          typeof isPublic === 'boolean' ? { isPublic } : {},
        ],
      },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: { author: true, feedbacks: true },
    });
  },
};

const Mutation = {
  createPrompt: async (
    _parent: any,
    args: { title: string; content: string; tags?: string[]; isPublic?: boolean; remixOf?: string; imageUrl?: string },
    context: Context
  ) => {
    if (!context.user) throw new Error('Not authenticated');
    return context.prisma.prompt.create({
      data: {
        title: args.title,
        content: args.content,
        tags: args.tags || [],
        isPublic: args.isPublic ?? false,
        remixOf: args.remixOf,
        authorId: context.user.id,
        imageUrl: args.imageUrl,
      },
    });
  },
  updatePrompt: async (
    _parent: any,
    args: { id: string; title?: string; content?: string; tags?: string[]; isPublic?: boolean; imageUrl?: string },
    context: Context
  ) => {
    if (!context.user) throw new Error('Not authenticated');
    // Optionally, check if user is the author
    const prompt = await context.prisma.prompt.findUnique({ where: { id: args.id } });
    if (!prompt || prompt.authorId !== context.user.id) throw new Error('Unauthorized');
    return context.prisma.prompt.update({
      where: { id: args.id },
      data: {
        title: args.title,
        content: args.content,
        tags: args.tags,
        isPublic: args.isPublic,
        imageUrl: args.imageUrl,
      },
    });
  },
  deletePrompt: async (_parent: any, args: { id: string }, context: Context) => {
    if (!context.user) throw new Error('Not authenticated');
    const prompt = await context.prisma.prompt.findUnique({ where: { id: args.id } });
    if (!prompt || prompt.authorId !== context.user.id) throw new Error('Unauthorized');
    await context.prisma.prompt.delete({ where: { id: args.id } });
    return true;
  },
};

const Prompt = {
  author: (parent: any, _args: any, context: Context) =>
    context.prisma.user.findUnique({ where: { id: parent.authorId } }),
  feedbacks: (parent: any, _args: any, context: Context) =>
    context.prisma.feedback.findMany({ where: { promptId: parent.id } }),
};

export default {
  Query,
  Mutation,
  Prompt,
};