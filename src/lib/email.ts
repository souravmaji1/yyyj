import { NextRequest } from 'next/server';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export interface EmailTemplate {
  subject: string;
  html: string;
}

/**
 * Email configuration from environment variables
 */
const EMAIL_CONFIG = {
  from: process.env.EMAIL_FROM || 'IntelliVerseX <no-reply@intelli-verse-x.ai>',
  salesTo: process.env.EMAIL_TO_SALES || 'sales@intelli-verse-x.ai',
  supportTo: process.env.EMAIL_TO_SUPPORT || 'support@intelli-verse-x.ai',
  smtp: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION || 'us-east-1',
  },
};

/**
 * Create email templates for different use cases
 */
export function createEmailTemplate(type: 'contact' | 'careers', data: any): EmailTemplate {
  switch (type) {
    case 'contact':
      return {
        subject: `[Contact] ${data.topic} - ${data.name}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #011A62;">New Contact Form Submission</h2>
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
              <p><strong>Name:</strong> ${data.name}</p>
              <p><strong>Email:</strong> ${data.email}</p>
              <p><strong>Topic:</strong> ${data.topic}</p>
              <p><strong>Page:</strong> ${data.page || 'Contact'}</p>
              <div style="margin-top: 20px;">
                <strong>Message:</strong>
                <div style="background-color: white; padding: 15px; border-radius: 4px; margin-top: 10px;">
                  ${data.message.replace(/\n/g, '<br>')}
                </div>
              </div>
            </div>
            <p style="color: #666; font-size: 12px; margin-top: 20px;">
              This email was sent from the IntelliVerseX contact form.
            </p>
          </div>
        `,
      };

    case 'careers':
      return {
        subject: `[Careers Interest] ${data.roleInterested || 'General'} - ${data.name}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #011A62;">New Career Interest Submission</h2>
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
              <p><strong>Name:</strong> ${data.name}</p>
              <p><strong>Email:</strong> ${data.email}</p>
              <p><strong>Role Interested:</strong> ${data.roleInterested}</p>
              ${data.resumeUrl ? `<p><strong>Resume:</strong> <a href="${data.resumeUrl}">View Resume</a></p>` : ''}
              <div style="margin-top: 20px;">
                <strong>Message:</strong>
                <div style="background-color: white; padding: 15px; border-radius: 4px; margin-top: 10px;">
                  ${data.message.replace(/\n/g, '<br>')}
                </div>
              </div>
            </div>
            <p style="color: #666; font-size: 12px; margin-top: 20px;">
              This email was sent from the IntelliVerseX careers page.
            </p>
          </div>
        `,
      };

    default:
      throw new Error(`Unknown email template type: ${type}`);
  }
}

/**
 * Send email using SMTP (fallback method)
 * This is a stub implementation - in production you would use nodemailer
 */
async function sendEmailSMTP(options: EmailOptions): Promise<boolean> {
  // In a real implementation, you would use nodemailer:
  // const nodemailer = require('nodemailer');
  // const transporter = nodemailer.createTransporter({ ... });
  // await transporter.sendMail(options);
  
  console.log('SMTP Email would be sent:', {
    to: options.to,
    subject: options.subject,
    from: options.from,
    smtp: EMAIL_CONFIG.smtp.host,
  });
  
  // Simulate email sending
  return new Promise((resolve) => {
    setTimeout(() => resolve(true), 100);
  });
}

/**
 * Send email using AWS SES (preferred method)
 * This is a stub implementation - in production you would use AWS SDK
 */
async function sendEmailSES(options: EmailOptions): Promise<boolean> {
  // In a real implementation, you would use AWS SDK:
  // const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');
  // const client = new SESClient({ region: EMAIL_CONFIG.aws.region });
  // await client.send(new SendEmailCommand({ ... }));
  
  console.log('SES Email would be sent:', {
    to: options.to,
    subject: options.subject,
    from: options.from,
    region: EMAIL_CONFIG.aws.region,
  });
  
  // Simulate email sending
  return new Promise((resolve) => {
    setTimeout(() => resolve(true), 100);
  });
}

/**
 * Main email sending function
 * Attempts SES first, falls back to SMTP
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  const emailOptions: EmailOptions = {
    ...options,
    from: options.from || EMAIL_CONFIG.from,
  };

  try {
    // Try AWS SES first if credentials are available
    if (EMAIL_CONFIG.aws.accessKeyId && EMAIL_CONFIG.aws.secretAccessKey) {
      return await sendEmailSES(emailOptions);
    }
    
    // Fall back to SMTP if configured
    if (EMAIL_CONFIG.smtp.host && EMAIL_CONFIG.smtp.user && EMAIL_CONFIG.smtp.pass) {
      return await sendEmailSMTP(emailOptions);
    }
    
    // If no email service is configured, log and return false
    console.error('No email service configured. Please set up AWS SES or SMTP credentials.');
    return false;
    
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
}

/**
 * Get the appropriate recipient email based on form type
 */
export function getRecipientEmail(type: 'contact' | 'careers' | 'sales' | 'support'): string {
  switch (type) {
    case 'contact':
    case 'sales':
      return EMAIL_CONFIG.salesTo;
    case 'careers':
    case 'support':
      return EMAIL_CONFIG.supportTo;
    default:
      return EMAIL_CONFIG.salesTo;
  }
}

/**
 * Validate email configuration
 */
export function validateEmailConfig(): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!EMAIL_CONFIG.from) {
    errors.push('EMAIL_FROM environment variable is required');
  }
  
  // Check if either SES or SMTP is configured
  const hasSES = EMAIL_CONFIG.aws.accessKeyId && EMAIL_CONFIG.aws.secretAccessKey;
  const hasSMTP = EMAIL_CONFIG.smtp.host && EMAIL_CONFIG.smtp.user && EMAIL_CONFIG.smtp.pass;
  
  if (!hasSES && !hasSMTP) {
    errors.push('Either AWS SES credentials or SMTP configuration is required');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}