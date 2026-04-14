import 'dotenv/config';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { typeDefs } from './graphql/schema';
import resolvers from './graphql/resolvers';
import { prisma } from './lib/prisma';
import { redis, connectRedis } from './lib/redis';
import jwt from 'jsonwebtoken';
import EmailWorker from './workers/email.worker';

const PORT = process.env.PORT || 4000;

async function startServer() {
  // Connect Redis (optional - continue if it fails)
  let redisConnected = false;
  try {
    await connectRedis();
    redisConnected = true;
    console.log('✅ Redis connected successfully');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.warn('⚠️  Redis connection failed, continuing without Redis:', errorMessage);
    console.warn('   Rate limiting and session storage will be disabled');
  }

  // Start Email Worker
  const emailWorker = new EmailWorker();
  await emailWorker.start();

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
        redis: redisConnected ? redis : null,
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

  // Add request logging middleware
  app.use((req, res, next) => {
    console.log(`📥 ${req.method} ${req.path} - ${new Date().toISOString()}`);
    next();
  });

  app.listen(PORT,'0.0.0.0', () => {
    console.log(`🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`);
    console.log(`📧 Email worker started successfully`);
    if (redisConnected) {
      console.log(`🔴 Redis: Connected`);
    } else {
      console.log(`🔴 Redis: Not available (rate limiting disabled)`);
    }
  });
}

startServer().catch((e) => {
  console.error(e);
  process.exit(1);
});
