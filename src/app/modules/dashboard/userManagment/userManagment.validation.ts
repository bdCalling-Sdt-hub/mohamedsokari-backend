import { z } from 'zod';

const updateStatus = z.object({
  body: z.object({
    status: z.enum(['active', 'banned'], {
      errorMap: () => {
        return {
          message: 'Invalid status. Valid values are "active" or "banned".',
        };
      },
    }),
  }),
});

export const userManagmentValidations = {
  updateStatus,
};
