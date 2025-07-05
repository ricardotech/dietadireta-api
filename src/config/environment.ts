import { z } from 'zod';

const envSchema = z.object({
  PORT: z.string().default('3000'),
  DB_HOST: z.string().default('localhost'),
  DB_PORT: z.string().default('5432'),
  DB_USERNAME: z.string().default('postgres'),
  DB_PASSWORD: z.string().default('password'),
  DB_NAME: z.string().default('nutri_online'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters long'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  // SMTP Configuration
  SMTP_HOST: z.string().default('smtp.gmail.com'),
  SMTP_PORT: z.string().transform(Number).default('587'),
  SMTP_SECURE: z.string().transform(val => val === 'true').default('false'),
  SMTP_USER: z.string().min(1, 'SMTP_USER is required'),
  SMTP_PASS: z.string().min(1, 'SMTP_PASS is required'),
  SMTP_FROM: z.string().email('SMTP_FROM must be a valid email'),
  FRONTEND_URL: z.string().url().default('http://localhost:3001'),
});

export const env = envSchema.parse(process.env);