import z from "zod"

const createIssueSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(150),
  description: z.string().min(10, 'Description is required'),
  category: z.enum(['maintenance', 'wifi', 'canteen', 'transport', 'other']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  images: z.array(z.string()).optional()
});

const updateIssueSchema = z.object({
  status: z.enum(['open', 'in-progress', 'resolved', 'closed']),
  resolutionNotes: z.string().optional(),
  assignedTo: z.string().optional() // user ID
});


export {
    createIssueSchema,
    updateIssueSchema
}