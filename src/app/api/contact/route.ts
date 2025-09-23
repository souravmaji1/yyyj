import { NextRequest, NextResponse } from 'next/server';
import { sendEmail, createEmailTemplate, getRecipientEmail } from '@/src/lib/email';
import { rateLimit } from '@/src/lib/security';

interface ContactFormData {
  name: string;
  email: string;
  topic?: string;
  message: string;
  roleInterested?: string;
  resumeUrl?: string;
  page?: string;
  company?: string; // Honeypot field
}

/**
 * Validate form data
 */
function validateFormData(data: ContactFormData): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check required fields
  if (!data.name || data.name.trim().length < 2) {
    errors.push('Name is required and must be at least 2 characters');
  }

  if (!data.email || !data.email.includes('@')) {
    errors.push('Valid email address is required');
  }

  if (!data.message || data.message.trim().length < 10) {
    errors.push('Message is required and must be at least 10 characters');
  }

  // Honeypot validation - company field should be empty
  if (data.company && data.company.trim().length > 0) {
    errors.push('Bot detected');
  }

  // Basic length limits
  if (data.name && data.name.length > 100) {
    errors.push('Name is too long');
  }

  if (data.email && data.email.length > 255) {
    errors.push('Email is too long');
  }

  if (data.message && data.message.length > 5000) {
    errors.push('Message is too long');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Get client IP address from request
 */
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const remoteAddr = request.headers.get('x-vercel-forwarded-for');
  
  if (forwarded) {
    return forwarded.split(',')[0]?.trim() || 'unknown';
  }
  
  if (realIP) {
    return realIP.trim();
  }
  
  if (remoteAddr) {
    return remoteAddr.split(',')[0]?.trim() || 'unknown';
  }
  
  return 'unknown';
}

/**
 * Handle contact form submissions
 */
async function handleContactForm(request: NextRequest): Promise<NextResponse> {
  try {
    // Rate limiting: 10 requests per 10 minutes per IP
    const clientIP = getClientIP(request);
    const userAgent = request.headers.get('user-agent') || 'unknown';
    const identifier = `${clientIP}:${userAgent}`;
    
    const limit = rateLimit(identifier, 10, 10 * 60 * 1000); // 10 requests per 10 minutes
    
    if (!limit.success) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Rate limit exceeded. Please try again later.',
          retryAfter: Math.ceil((limit.resetTime - Date.now()) / 1000),
        },
        { status: 429 }
      );
    }

    // Parse form data - support both JSON and form-encoded
    let formData: ContactFormData;
    
    const contentType = request.headers.get('content-type') || '';
    
    if (contentType.includes('application/json')) {
      formData = await request.json();
    } else if (contentType.includes('application/x-www-form-urlencoded')) {
      const form = await request.formData();
      formData = {
        name: form.get('name') as string,
        email: form.get('email') as string,
        topic: form.get('topic') as string,
        message: form.get('message') as string,
        roleInterested: form.get('roleInterested') as string,
        resumeUrl: form.get('resumeUrl') as string,
        page: form.get('page') as string,
        company: form.get('company') as string, // Honeypot
      };
    } else {
      return NextResponse.json(
        { ok: false, error: 'Unsupported content type' },
        { status: 400 }
      );
    }

    // Validate form data
    const validation = validateFormData(formData);
    if (!validation.isValid) {
      return NextResponse.json(
        { ok: false, error: 'Validation failed', details: validation.errors },
        { status: 400 }
      );
    }

    // Determine email type and recipient
    const isCareerForm = formData.page === 'careers' || formData.roleInterested;
    const emailType = isCareerForm ? 'careers' : 'contact';
    const recipientEmail = getRecipientEmail(emailType);

    // Create email template
    const template = createEmailTemplate(emailType, formData);

    // Send email
    const emailSent = await sendEmail({
      to: recipientEmail,
      subject: template.subject,
      html: template.html,
    });

    if (!emailSent) {
      console.error('Failed to send email for form submission');
      return NextResponse.json(
        { ok: false, error: 'Failed to send message. Please try again later.' },
        { status: 500 }
      );
    }

    // Log successful submission (for monitoring)
    console.log(`Contact form submitted successfully: ${emailType} from ${formData.email}`);

    return NextResponse.json({
      ok: true,
      message: 'Message sent successfully. We will get back to you soon!',
    });

  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { ok: false, error: 'An unexpected error occurred. Please try again later.' },
      { status: 500 }
    );
  }
}

// Export the POST handler
export async function POST(request: NextRequest): Promise<NextResponse> {
  return handleContactForm(request);
}

// Optional: Handle GET requests with a helpful message
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    message: 'IntelliVerseX Contact API',
    methods: ['POST'],
    fields: {
      required: ['name', 'email', 'message'],
      optional: ['topic', 'roleInterested', 'resumeUrl', 'page'],
    },
    rateLimit: '10 requests per 10 minutes per IP',
  });
}