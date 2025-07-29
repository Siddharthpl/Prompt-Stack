import userResolvers from './user';
import promptResolvers from './prompt';
import feedbackResolvers from './feedback';
import authResolvers from './auth';

export default {
  Query: {
    ...userResolvers.Query,
    ...promptResolvers.Query,
    ...feedbackResolvers.Query,
  },
  Mutation: {
    ...authResolvers.Mutation,
    ...userResolvers.Mutation,
    ...promptResolvers.Mutation,
    ...feedbackResolvers.Mutation,
  },
  User: userResolvers.User,
  Prompt: promptResolvers.Prompt,
  Feedback: feedbackResolvers.Feedback,
};