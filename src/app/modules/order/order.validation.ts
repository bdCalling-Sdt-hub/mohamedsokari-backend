import { z } from 'zod';

const orderSchema = z.object({
  body: z.object({
    productId: z.string(),
    customerId: z.string(),
    totalPrice: z
      .string()
      .min(0, 'Total price must be a positive number')
      .max(10000, 'Total price is too high'),
    status: z.enum(['pending', 'completed']).default('pending'),
    confirmBybyer: z.boolean().default(false),
    confirmByseller: z.boolean().default(false),
  }),
});

export const OrderValidation = { orderSchema };
