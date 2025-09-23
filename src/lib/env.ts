import { z } from 'zod';

/**
 * Environment variables validation schema
 * Ensures all required secrets and configuration are present and valid
 */
const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url('Invalid database URL'),
  
  // Authentication
  NEXTAUTH_URL: z.string().url('Invalid NextAuth URL'),
  NEXTAUTH_SECRET: z.string().min(32, 'NextAuth secret must be at least 32 characters'),
  
  // API Keys (optional based on features used)
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
  
  // External APIs
  API_BASE_URL: z.string().url('Invalid API base URL'),
  
  // Feature flags
  NODE_ENV: z.enum(['development', 'test', 'production']),
  
  // Security
  ENCRYPTION_KEY: z.string().min(32, 'Encryption key must be at least 32 characters').optional(),
  
  // Rate limiting
  RATE_LIMIT_MAX: z.string().transform(Number).pipe(z.number().min(1)),
  RATE_LIMIT_WINDOW: z.string().transform(Number).pipe(z.number().min(1000)),
}).transform((env) => ({
  ...env,
  RATE_LIMIT_MAX: Number(env.RATE_LIMIT_MAX),
  RATE_LIMIT_WINDOW: Number(env.RATE_LIMIT_WINDOW),
}));

/**
 * Validates environment variables at application startup
 * Throws descriptive errors for missing or invalid configuration
 */
export function validateEnv() {
  try {
    const env = envSchema.parse({
      DATABASE_URL: process.env.DATABASE_URL,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
      STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY,
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
      API_BASE_URL: process.env.API_BASE_URL || 'https://api.intelli-verse-x.ai',
      NODE_ENV: process.env.NODE_ENV || 'development',
      ENCRYPTION_KEY: process.env.ENCRYPTION_KEY,
      RATE_LIMIT_MAX: process.env.RATE_LIMIT_MAX || '100',
      RATE_LIMIT_WINDOW: process.env.RATE_LIMIT_WINDOW || '60000',
    });
    
    return env;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map(
        (err) => `${err.path.join('.')}: ${err.message}`
      );
      throw new Error(
        `Environment validation failed:\n${errorMessages.join('\n')}`
      );
    }
    throw error;
  }
}

/**
 * Safe environment access with validation
 */
export const env = validateEnv();

/**
 * Type-safe environment variables
 */
export type Env = z.infer<typeof envSchema>;