import express, { NextFunction, Request, Response } from 'express';
import { USER_ROLES } from '../../../enums/user';
import { MessageController } from './message.controller';
import auth from '../../middleware/auth';
import fileUploadHandler from '../../middleware/fileUploadHandler';
import parseSingleFileData from '../../middleware/parseFileData';

const router = express.Router();

router.post(
  '/send-message/:chatId',
  auth(USER_ROLES.USER, USER_ROLES.SUPER_ADMIN),
  fileUploadHandler(),
  parseSingleFileData,
  MessageController.sendMessage,
);
router.get(
  '/:id',
  auth(USER_ROLES.USER, USER_ROLES.SUPER_ADMIN),
  MessageController.getAllMessage,
);
router.post(
  '/react/:messageId',
  auth(USER_ROLES.USER, USER_ROLES.SUPER_ADMIN),
  MessageController.addReaction,
);
router.delete(
  '/delete/:messageId',
  auth(USER_ROLES.USER, USER_ROLES.SUPER_ADMIN),
  MessageController.deleteMessage,
);

export const MessageRoutes = router;
