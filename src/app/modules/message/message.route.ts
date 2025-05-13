import express, { NextFunction, Request, Response } from 'express';
import { USER_ROLES } from '../../../enums/user';
import { MessageController } from './message.controller';
import auth from '../../middleware/auth';
import fileUploadHandler from '../../middleware/fileUploadHandler';
import parseSingleFileData from '../../middleware/parseFileData';

const router = express.Router();

router.post(
  '/send-message/:chatId',
  auth(USER_ROLES.USER),
  fileUploadHandler(),
  parseSingleFileData,
  MessageController.sendMessage,
);
router.get('/:id', auth(USER_ROLES.USER), MessageController.getAllMessage);
router.post(
  '/react/:messageId',
  auth(USER_ROLES.USER),
  MessageController.addReaction,
);
router.post(
  '/delete/:messageId',
  auth(USER_ROLES.USER),
  MessageController.deleteMessage,
);

export const MessageRoutes = router;
