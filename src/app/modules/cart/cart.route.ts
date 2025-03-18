import express from 'express';
import cartController from './cart.controller';
import auth from '../../middleware/auth';
import { USER_ROLES } from '../../../enums/user';
const router = express.Router();

router.get('/', auth(USER_ROLES.USER), cartController.getCarts);
router.post('/', auth(USER_ROLES.USER), cartController.addToCart);
router.delete('/:productId', auth(USER_ROLES.USER), cartController.removeCart);

export const CartRoute = router;
