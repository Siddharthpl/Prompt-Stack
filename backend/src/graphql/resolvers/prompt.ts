import { PrismaClient } from '@prisma/client';

type Context = {
  prisma: PrismaClient;
  user?: any;
  redis?: any;
};

const Query = {
  prompt: async (_parent: any, args: { id: string }, context: Context) => {
    const cacheKey = `prompt:${args.id}`;
    if (context.redis) {
      const cached = await context.redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    }
    const prompt = await context.prisma.prompt.findUnique({
      where: { id: args.id },
      include: { author: true, feedbacks: true },
    });
    if (context.redis && prompt) {
      await context.redis.set(cacheKey, JSON.stringify(prompt), { EX: 600 });
    }
    return prompt;
  },
  prompts: async (
    _parent: any,
    args: { search?: string; tags?: string[]; authorId?: string; isPublic?: boolean; skip?: number; take?: number },
    context: Context
  ) => {
    const { search, tags, authorId, isPublic, skip = 0, take = 10 } = args;
    // Create a cache key based on arguments
    const cacheKey = `prompts:${JSON.stringify({ search, tags, authorId, isPublic, skip, take })}`;
    if (context.redis) {
      const cached = await context.redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    }
    const prompts = await context.prisma.prompt.findMany({
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
    if (context.redis) {
      await context.redis.set(cacheKey, JSON.stringify(prompts), { EX: 300 }); // 5 min
    }
    return prompts;
  },
};

const Mutation = {
  createPrompt: async (
    _parent: any,
    args: { title: string; content: string; tags?: string[]; isPublic?: boolean; remixOf?: string; imageUrl?: string },
    context: Context
  ) => {
    if (!context.user) throw new Error('Not authenticated');
    const created = await context.prisma.prompt.create({
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
    // Invalidate single and list prompt caches
    if (context.redis) {
      await context.redis.del(`prompts:*`); // delete all prompt list caches
    }
    return created;
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
    const updated = await context.prisma.prompt.update({
      where: { id: args.id },
      data: {
        title: args.title,
        content: args.content,
        tags: args.tags,
        isPublic: args.isPublic,
        imageUrl: args.imageUrl,
      },
    });
    // Invalidate caches
    if (context.redis) {
      await context.redis.del(`prompt:${args.id}`);
      await context.redis.del(`prompts:*`);
    }
    return updated;
  },
  deletePrompt: async (_parent: any, args: { id: string }, context: Context) => {
    if (!context.user) throw new Error('Not authenticated');
    const prompt = await context.prisma.prompt.findUnique({ where: { id: args.id } });
    if (!prompt || prompt.authorId !== context.user.id) throw new Error('Unauthorized');
    await context.prisma.prompt.delete({ where: { id: args.id } });
    // Invalidate caches
    if (context.redis) {
      await context.redis.del(`prompt:${args.id}`);
      await context.redis.del(`prompts:*`);
    }
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