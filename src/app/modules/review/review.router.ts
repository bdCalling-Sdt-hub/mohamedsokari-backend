import express from 'express';
import { USER_ROLES } from '../../../enums/user';
import { ReviewController } from './review.controller';
import { ReviewValidation } from './review.validation';
import auth from '../../middleware/auth';
import validateRequest from '../../middleware/validateRequest';
const router = express.Router();

router.get(
  '/analysis',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  ReviewController.getAnalysis,
);
router.get(
  '/',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  ReviewController.getAllReview,
);
router.post(
  '/',
  auth(USER_ROLES.USER),
  validateRequest(ReviewValidation.reviewZodSchema),
  ReviewController.createReview,
);
router.delete(
  '/:id',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  ReviewController.removeReview,
);

export const ReviewRoutes = router;