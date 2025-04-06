import express from 'express';
import auth from '../../middleware/auth';
import { USER_ROLES } from '../../../enums/user';
import { LikedProductsController } from './liked.controller';

const router = express.Router();

router.post(
  '/:productId',
  auth(USER_ROLES.USER),
  LikedProductsController.likedProductsOrUnliked,
);
router.get(
  '/:productId',
  auth(USER_ROLES.USER),
  LikedProductsController.getLikedProduct,
);

export const LikedRouter = router;
