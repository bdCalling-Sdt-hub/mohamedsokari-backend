import express from 'express';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middleware/auth';
import validateRequest from '../../middleware/validateRequest';
import { CustomerReviewController } from './customerreview.controller';
import { CustomerReviewValidation } from './customerreview.validation';
import fileUploadHandler from '../../middleware/fileUploadHandler';
import parseMultipleFiledata from '../../middleware/parseMultipleFiledata';
const router = express.Router();

// Create a review
router.post(
  '/:id',
  auth(USER_ROLES.USER),
  fileUploadHandler(),
  parseMultipleFiledata,
  validateRequest(CustomerReviewValidation.reviewZodSchema),
  CustomerReviewController.createReview,
);
// Get all reviews
router.get('/:id', CustomerReviewController.analysisReview);

// Update a review
router.put(
  '/:id',
  auth(USER_ROLES.USER),
  fileUploadHandler(),
  parseMultipleFiledata,
  validateRequest(CustomerReviewValidation.updateReviewZodSchema),
  CustomerReviewController.updateReview,
);

// Delete a review
router.delete(
  '/:id',
  auth(USER_ROLES.USER),
  CustomerReviewController.deleteReview,
);

export const CustomerReviewRoutes = router;
