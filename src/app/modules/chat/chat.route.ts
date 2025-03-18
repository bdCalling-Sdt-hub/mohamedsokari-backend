/** @format */

import { Router } from 'express';
import auth from '../../middleware/auth';
import { chatController } from './chat.controller';
import { USER_ROLES } from '../../../enums/user';

const router = Router();

router.get(
  '/',
  auth(USER_ROLES.USER, USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  chatController.getAllChats,
);

export const ChatRouter = router;
