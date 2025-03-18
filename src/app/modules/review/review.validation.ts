import { z } from 'zod';

const reviewZodSchema = z.object({
  body: z.object({
    rating: z
      .number({ required_error: 'Rating is required' })
      .min(1, 'Rating must be at least 1')
      .max(5, 'Rating must be at most 5'),
    comment: z.string({ required_error: 'Comment is required' }),
  }),
});

export const ReviewValidation = { reviewZodSchema };
