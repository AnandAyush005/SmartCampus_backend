import { z } from 'zod';

export const createNoticeSchema = z.object({
    title: z.string().trim().min(5, "Title required").max(200),
    content: z.string().trim().min(10, "Content required"),
    category: z.enum(['event', 'notice', 'holiday', 'exam']),
    eventDate: z.string().optional().transform(val => val ? new Date(val) : undefined),
    isPinned: z.boolean().optional()
});

export const updateNoticeSchema = createNoticeSchema.partial();
