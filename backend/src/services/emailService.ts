// src/services/emailService.ts
import nodemailer from 'nodemailer';
import path from 'path';
import { createTransport } from 'nodemailer';
import { compile } from 'handlebars';
import { readFileSync } from 'fs';

// Types
interface EmailOptions {
  to: string;
  subject: string;
  template: string;
  context: Record<string, any>;
  priority?: 'high' | 'normal' | 'low';
  retryCount?: number;
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

// Send email with retry logic
export const sendEmail = async (options: EmailOptions): Promise<boolean> => {
  const { to, subject, template, context, priority = 'normal', retryCount = 0 } = options;
  
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
    return true;
  } catch (error) {
    console.error(`Email send failed (attempt ${retryCount + 1}):`, error);
    
    // Exponential backoff for retries
    if (retryCount < 3) {
      const delay = Math.pow(2, retryCount) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
      return sendEmail({ ...options, retryCount: retryCount + 1 });
    }
    
    return false;
  }
};