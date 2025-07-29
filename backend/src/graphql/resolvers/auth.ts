import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
const JWT_SECRET = process.env.JWT_SECRET!;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

type Context = {
  prisma: PrismaClient;
};

function generateToken(user: any) {
  return jwt.sign(
    { id: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

const Mutation = {
  signup: async (
    _parent: any,
    args: { email: string; password: string; name?: string; avatarUrl?: string },
    context: Context
  ) => {
    const existing = await context.prisma.user.findUnique({ where: { email: args.email } });
    if (existing) throw new Error('Email already in use.');
    const hashedPassword = await bcrypt.hash(args.password, 10);
    const user = await context.prisma.user.create({
      data: {
        email: args.email,
        password: hashedPassword,
        name: args.name ?? "",
        avatarUrl: args.avatarUrl ?? "",
        googleId: null, // Ensure googleId is null for non-Google signups
      },
    });
    const token = generateToken(user);
    return { token, user };
  },
  login: async (
    _parent: any,
    args: { email: string; password: string },
    context: Context
  ) => {
    const user = await context.prisma.user.findUnique({ where: { email: args.email } });
    if (!user || !user.password) throw new Error('Invalid credentials.');
    const valid = await bcrypt.compare(args.password, user.password);
    if (!valid) throw new Error('Invalid credentials.');
    const token = generateToken(user);
    return { token, user };
  },
  googleAuth: async (
  _parent: any,
  args: { token: string; avatarUrl?: string }, 
  context: Context
) => {
  if (!GOOGLE_CLIENT_ID) throw new Error("Google client not configured");

  const client = new OAuth2Client(GOOGLE_CLIENT_ID);
  const ticket = await client.verifyIdToken({
    idToken: args.token,
    audience: GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  if (!payload || !payload.email) throw new Error("Google token invalid");

  // Check if user exists
  let user = await context.prisma.user.findUnique({
    where: { email: payload.email },
  });

  // Create if not exists
  if (!user) {
    user = await context.prisma.user.create({
      data: {
        email: payload.email,
        name: payload.name ?? "",
        avatarUrl: args.avatarUrl || null,
        googleId: payload.sub,
      },
    });
  }

  const jwtToken = generateToken(user);
  return { token: jwtToken, user };
}
};

export default {
  Mutation,
};