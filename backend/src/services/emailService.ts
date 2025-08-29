// src/services/emailService.ts
import nodemailer from 'nodemailer';
import path from 'path';
import { createTransport } from 'nodemailer';
import { compile } from 'handlebars';
import { readFileSync } from 'fs';
import { emailQueue } from './rabbitmq';

// Types
export interface EmailOptions {
  to: string;
  subject: string;
  template: string;
  context: Record<string, any>;
  priority?: 'high' | 'normal' | 'low';
  retryCount?: number;
}

export interface EmailJob {
  type: 'SEND_EMAIL';
  data: EmailOptions;
  metadata?: {
    userId?: string;
    source?: string;
    timestamp?: Date;
  };
}

// Create transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  pool: true,
  maxConnections: 10,
  maxMessages: 100,
  rateDelta: 2000,
  rateLimit: 5,
});


// Compile email templates
const compileTemplate = (templateName: string, context: any) => {
  const templatePath = path.join(__dirname, `../../emails/templates/${templateName}.hbs`);
  const template = compile(readFileSync(templatePath, 'utf8'));
  return template(context);
};

// Add email job to the queue
export const queueEmail = async (options: EmailOptions, metadata?: EmailJob['metadata']): Promise<boolean> => {
  try {
    // console.log('📧 queueEmail called with options:', { to: options.to, subject: options.subject });
    
    const job: EmailJob = {
      type: 'SEND_EMAIL',
      data: options,
      metadata: {
        ...metadata,
        timestamp: new Date(),
      },
    };
    
    // console.log('📧 Publishing email job to queue...');
    await emailQueue.publish(job);
    console.log('✅ Email job published to queue successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to queue email:', error);
    return false;
  }
};

// Process email job from the queue
export const processEmailJob = async (job: EmailJob): Promise<boolean> => {
  if (job.type !== 'SEND_EMAIL') {
    console.warn('Unknown job type:', job.type);
    return false;
  }

  const { to, subject, template, context, priority = 'normal', retryCount = 0 } = job.data;
  
  try {
    const html = compileTemplate(template, context);
    
    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM_ADDRESS}>`,
      to,
      subject,
      html,
      priority,
      headers: {
        'X-Priority': priority === 'high' ? '1' : priority === 'low' ? '5' : '3',
        'X-MSMail-Priority': priority === 'high' ? 'High' : 'Normal',
        'Importance': priority,
      },
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${to}`);
    return true;
  } catch (error) {
    console.error(`Email send failed (attempt ${retryCount + 1}):`, error);
    
    // Exponential backoff for retries
    if (retryCount < 3) {
      const delay = Math.pow(2, retryCount) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
      return processEmailJob({
        ...job,
        data: { ...job.data, retryCount: retryCount + 1 }
      });
    }
    
    console.error(`Max retries reached for email to ${to}`);
    return false;
  }
};

// For backward compatibility
export const sendEmail = async (options: EmailOptions): Promise<boolean> => {
  return queueEmail(options);
};