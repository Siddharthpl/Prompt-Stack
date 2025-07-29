import 'dotenv/config';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { typeDefs } from './graphql/schema';
import resolvers from './graphql/resolvers';
import { prisma } from './lib/prisma';
import { redis, connectRedis } from './lib/redis';
import jwt from 'jsonwebtoken';

const PORT = process.env.PORT || 4000;

async function startServer() {
  // Connect Redis
  await connectRedis();

  // Express app
  const app = express();

  // Apollo Server setup
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: async ({ req }) => {
      // JWT Auth example. You can expand this for Google OAuth.
      const token = req.headers.authorization?.replace("Bearer ", "");
      let user = null;
      if (token) {
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET!);
          user = decoded;
        } catch (err) {
          // Invalid token, user remains null
        }
      }
      return {
        prisma,
        redis,
        user,
        req
      };
    },
  });

  await server.start();
  server.applyMiddleware({ app, path: '/graphql' });

  app.get('/', (_req, res) => {
    res.send('Prompt Stack backend running!');
  });

  app.listen(PORT, () => {
    console.log(`🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`);
  });
}

startServer().catch((e) => {
  console.error(e);
  process.exit(1);
});