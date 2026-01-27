import { z } from 'zod';
import { insertJobSchema } from './schema';

export const api = {
  auth: {
    login: {
      method: 'POST' as const,
      path: '/api/v1/auth/login',
      input: z.object({
        username: z.string(),
        password: z.string(),
      }),
      responses: {
        200: z.object({
          id: z.number(),
          username: z.string(),
          branch: z.string(),
          role: z.string(),
        }),
      },
    },
  },
  services: {
    cards: {
      list: {
        method: 'GET' as const,
        path: '/api/v1/services/cards',
        responses: {
          200: z.array(z.object({
            id: z.number(),
            queueNumber: z.number(),
            regNumber: z.string(),
            customerName: z.string(),
            serviceType: z.string(),
            brand: z.string(),
            status: z.string(),
            branch: z.string(),
            isPriority: z.boolean().nullable(),
            createdAt: z.string().nullable(),
          })),
        },
      },
      create: {
        method: 'POST' as const,
        path: '/api/v1/services/cards',
        input: insertJobSchema,
        responses: {
          201: z.object({
            id: z.number(),
            queueNumber: z.number(),
            regNumber: z.string(),
            customerName: z.string(),
            serviceType: z.string(),
            brand: z.string(),
            status: z.string(),
            branch: z.string(),
            isPriority: z.boolean().nullable(),
            createdAt: z.string().nullable(),
          }),
        },
      },
      update: {
        method: 'PATCH' as const,
        path: '/api/v1/services/cards/:id',
        input: insertJobSchema.partial(),
        responses: {
          200: z.object({
            id: z.number(),
            queueNumber: z.number(),
            regNumber: z.string(),
            customerName: z.string(),
            serviceType: z.string(),
            brand: z.string(),
            status: z.string(),
            branch: z.string(),
            isPriority: z.boolean().nullable(),
            createdAt: z.string().nullable(),
          }),
        },
      },
      delete: {
        method: 'DELETE' as const,
        path: '/api/v1/services/cards/:id',
        responses: {
          204: z.void(),
        },
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
