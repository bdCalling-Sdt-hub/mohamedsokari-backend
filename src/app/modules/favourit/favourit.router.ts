import express from 'express';
import auth from '../../middleware/auth';
import { USER_ROLES } from '../../../enums/user';
import { FavouritProductsController } from './favourit.controller';

const router = express.Router();

router.post(
  '/:productId',
  auth(USER_ROLES.USER),
  FavouritProductsController.likedProductsOrUnliked,
);
router.get(
  '/',
  auth(USER_ROLES.USER),
  FavouritProductsController.getFavouritProducts,
);
router.delete(
  '/:productId',
  auth(USER_ROLES.USER),
  FavouritProductsController.removeLikedProduct,
);

export const FavouritdRouter = router;
