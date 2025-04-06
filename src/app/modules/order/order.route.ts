import express from 'express';
import { OrderController } from './order.conttroller';
import auth from '../../middleware/auth';
import { USER_ROLES } from '../../../enums/user';
import validateRequest from '../../middleware/validateRequest';
import { OrderValidation } from './order.validation';

const router = express.Router();

router.post(
  '/confirm-buyer',
  auth(USER_ROLES.USER),
  validateRequest(OrderValidation.orderSchema),
  OrderController.orderConfirmByBuyer,
);
router.post(
  '/confirm-seller/:id',
  auth(USER_ROLES.USER),
  OrderController.orderConfirmBySeller,
);
router.get('/:id', auth(USER_ROLES.USER), OrderController.getOrderbyId);
router.delete('/:id', auth(USER_ROLES.USER), OrderController.cancelledOrder);

export const OrderRouter = router;
