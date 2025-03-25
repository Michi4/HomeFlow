// backend/src/routes/auth.ts
import { Hono } from 'hono';
import { handle } from 'better-auth/hono';
import { auth } from '@/auth/auth';

export const authRoutes = new Hono().route('/auth', handle(auth));
