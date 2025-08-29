import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { queueEmail } from '../../services/emailService';

// console.log('🔍 queueEmail function imported:', typeof queueEmail);

const JWT_SECRET = process.env.JWT_SECRET!;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

type Context = {
  prisma: PrismaClient;
  redis?: any;
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
    // console.log('🚀 SIGNUP FUNCTION CALLED with email:', args.email);
    
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

    // Send welcome email
    try {
      // console.log('📧 Attempting to send welcome email to:', user.email);
      const emailQueued = await queueEmail({
        to: user.email,
        subject: 'Welcome to PromptHub! 🎉',
        template: 'welcome',
        context: {
          name: user.name || 'there',
          email: user.email,
          dashboardUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard`
        },
        priority: 'normal'
      }, {
        userId: user.id,
        source: 'signup'
      });
      
      if (emailQueued) {
        console.log('✅ Welcome email queued successfully for:', user.email);
      } else {
        console.log('❌ Failed to queue welcome email for:', user.email);
      }
    } catch (error) {
      console.error('❌ Failed to queue welcome email:', error);
      // Don't fail the signup if email fails
    }

    const token = generateToken(user);
    return { token, user };
  },
  login: async (
    _parent: any,
    args: { email: string; password: string },
    context: Context
  ) => {
    // Rate limit: max 5 login attempts per minute per email
    if (context.redis) {
      const rateKey = `login-rate:${args.email}`;
      const current = await context.redis.incr(rateKey);
      if (current === 1) {
        await context.redis.expire(rateKey, 60);
      }
      if (current > 5) {
        throw new Error('Too many login attempts. Please wait a minute.');
      }
    }
    const user = await context.prisma.user.findUnique({ where: { email: args.email } });
    if (!user || !user.password) throw new Error('Invalid credentials.');
    const valid = await bcrypt.compare(args.password, user.password);
    if (!valid) throw new Error('Invalid credentials.');
    const token = generateToken(user);
    // Store session in Redis for 1 day
    if (context.redis) {
      await context.redis.set(`session:${user.id}`, JSON.stringify({ token, user }), { EX: 86400 });
    }
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

    let isNewUser = false;

    // Create if not exists
    if (!user) {
      isNewUser = true;
      user = await context.prisma.user.create({
        data: {
          email: payload.email,
          name: payload.name ?? "",
          avatarUrl: args.avatarUrl || null,
          googleId: payload.sub,
        },
      });
    }

    // Send welcome email only for new users
    if (isNewUser) {
      try {
        await queueEmail({
          to: user.email,
          subject: 'Welcome to PromptHub! 🎉',
          template: 'welcome',
          context: {
            name: user.name || 'there',
            email: user.email,
            dashboardUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard`
          },
          priority: 'normal'
        }, {
          userId: user.id,
          source: 'google_signup'
        });
      } catch (error) {
        console.error('Failed to queue welcome email:', error);
        // Don't fail the auth if email fails
      }
    }

    const jwtToken = generateToken(user);
    return { token: jwtToken, user };
  }
};

export default {
  Mutation,
};