import { z } from 'zod';

export const productValidationSchema = z.object({
  body: z.object({
    title: z.string().min(1, { message: 'Title is required' }),
    price: z.string().min(0.01, { message: 'Price must be greater than 0' }),
    category: z.string().min(1, { message: 'Category is required' }),
    description: z.string().min(1, { message: 'Description is required' }),
    location: z.string().min(1, { message: 'Location is required' }),
    condition: z.enum(['Used but Good Conditions', 'Well Used'], {
      message: 'Condition must be valid',
    }),
    images: z
      .array(z.string(), { message: 'Images must be an array of strings' })
      .min(1, { message: 'At least one image is required' }),
  }),
});

export const ProductValidation = { productValidationSchema };
