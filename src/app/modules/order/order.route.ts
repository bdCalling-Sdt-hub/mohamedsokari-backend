import express from 'express';
import { OrderController } from './order.conttroller';
import auth from '../../middleware/auth';
import { USER_ROLES } from '../../../enums/user';

const router = express.Router();

router.post('/', auth(USER_ROLES.USER), OrderController.orderConfirmByBuyer);

export const OrderRouter = {};
