import { z } from 'zod';

/**
 * Common validation schemas for forms and API inputs
 * All schemas follow OWASP input validation guidelines
 */

// Basic field validations
export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Invalid email format')
  .max(254, 'Email too long') // RFC 5321 limit
  .transform((email) => email.toLowerCase().trim());

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password too long')
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
    'Password must contain uppercase, lowercase, number, and special character');

export const nameSchema = z
  .string()
  .min(1, 'Name is required')
  .max(100, 'Name too long')
  .regex(/^[a-zA-Z\s'-]+$/, 'Name contains invalid characters')
  .transform((name) => name.trim());

export const phoneSchema = z
  .string()
  .regex(/^\+?[\d\s\-\(\)]+$/, 'Invalid phone number format')
  .min(10, 'Phone number too short')
  .max(20, 'Phone number too long')
  .transform((phone) => phone.replace(/\s+/g, ''));

export const urlSchema = z
  .string()
  .url('Invalid URL format')
  .max(2048, 'URL too long'); // Common browser limit

// ID validations
export const uuidSchema = z
  .string()
  .uuid('Invalid ID format');

export const positiveIntSchema = z
  .number()
  .int('Must be an integer')
  .positive('Must be positive');

export const currencySchema = z
  .number()
  .nonnegative('Amount cannot be negative')
  .finite('Invalid amount')
  .multipleOf(0.01, 'Amount can have at most 2 decimal places');

// User registration schema
export const userRegistrationSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  firstName: nameSchema,
  lastName: nameSchema,
  phone: phoneSchema.optional(),
  acceptTerms: z.boolean().refine(val => val === true, 'You must accept the terms'),
});

// User login schema
export const userLoginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

// Profile update schema
export const profileUpdateSchema = z.object({
  firstName: nameSchema.optional(),
  lastName: nameSchema.optional(),
  phone: phoneSchema.optional(),
  bio: z.string().max(500, 'Bio too long').optional(),
});

// Address schema
export const addressSchema = z.object({
  street: z.string().min(1, 'Street address is required').max(200, 'Street address too long'),
  city: z.string().min(1, 'City is required').max(100, 'City name too long'),
  state: z.string().min(1, 'State is required').max(100, 'State name too long'),
  zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code format'),
  country: z.string().min(2, 'Country is required').max(2, 'Use 2-letter country code'),
  isDefault: z.boolean().optional(),
});

// Payment method schema
export const paymentMethodSchema = z.object({
  type: z.enum(['credit_card', 'debit_card', 'paypal', 'stripe']),
  last4: z.string().length(4, 'Last 4 digits required'),
  expiryMonth: z.number().int().min(1).max(12),
  expiryYear: z.number().int().min(new Date().getFullYear()),
  isDefault: z.boolean().optional(),
});

// Product review schema
export const reviewSchema = z.object({
  rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5'),
  title: z.string().min(1, 'Review title is required').max(100, 'Title too long'),
  comment: z.string().min(10, 'Comment must be at least 10 characters').max(1000, 'Comment too long'),
  productId: uuidSchema,
});

// Order schema
export const orderSchema = z.object({
  items: z.array(z.object({
    productId: uuidSchema,
    quantity: positiveIntSchema,
    price: currencySchema,
  })).min(1, 'Order must have at least one item'),
  shippingAddress: addressSchema,
  billingAddress: addressSchema.optional(),
  paymentMethodId: uuidSchema,
  notes: z.string().max(500, 'Notes too long').optional(),
});

// Contact form schema
export const contactSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  subject: z.string().min(1, 'Subject is required').max(200, 'Subject too long'),
  message: z.string().min(10, 'Message must be at least 10 characters').max(2000, 'Message too long'),
  phone: phoneSchema.optional(),
});

// Search schema
export const searchSchema = z.object({
  query: z.string().min(1, 'Search query is required').max(200, 'Query too long'),
  category: z.string().max(50, 'Category name too long').optional(),
  sortBy: z.enum(['relevance', 'price_asc', 'price_desc', 'rating', 'newest']).optional(),
  page: z.number().int().positive().max(1000).optional(),
  limit: z.number().int().positive().max(100).optional(),
});

// File upload schema
export const fileUploadSchema = z.object({
  name: z.string().min(1, 'Filename is required').max(255, 'Filename too long'),
  size: z.number().int().positive().max(10 * 1024 * 1024, 'File size cannot exceed 10MB'),
  type: z.string().regex(/^[a-zA-Z]+\/[a-zA-Z0-9\-\+\.]+$/, 'Invalid MIME type'),
});

// API response schemas
export const errorResponseSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.string().optional(),
    field: z.string().optional(),
  }),
});

export const successResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  message: z.string().optional(),
});

/**
 * Sanitizes HTML input to prevent XSS attacks
 */
export function sanitizeHtml(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Validates and sanitizes text input
 */
export function validateAndSanitizeText(
  input: string,
  maxLength: number = 1000,
  allowHtml: boolean = false
): string {
  if (typeof input !== 'string') {
    throw new Error('Input must be a string');
  }
  
  if (input.length > maxLength) {
    throw new Error(`Input exceeds maximum length of ${maxLength} characters`);
  }
  
  return allowHtml ? input.trim() : sanitizeHtml(input.trim());
}

/**
 * Validates file upload
 */
export function validateFileUpload(file: File): { valid: boolean; error?: string } {
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'text/plain',
    'application/json'
  ];
  
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'File type not allowed' };
  }
  
  if (file.size > 10 * 1024 * 1024) { // 10MB
    return { valid: false, error: 'File size exceeds 10MB limit' };
  }
  
  return { valid: true };
}

/**
 * Type definitions for validated schemas
 */
export type UserRegistration = z.infer<typeof userRegistrationSchema>;
export type UserLogin = z.infer<typeof userLoginSchema>;
export type ProfileUpdate = z.infer<typeof profileUpdateSchema>;
export type Address = z.infer<typeof addressSchema>;
export type PaymentMethod = z.infer<typeof paymentMethodSchema>;
export type Review = z.infer<typeof reviewSchema>;
export type Order = z.infer<typeof orderSchema>;
export type ContactForm = z.infer<typeof contactSchema>;
export type Search = z.infer<typeof searchSchema>;
export type FileUpload = z.infer<typeof fileUploadSchema>;
export type ErrorResponse = z.infer<typeof errorResponseSchema>;
export type SuccessResponse = z.infer<typeof successResponseSchema>;