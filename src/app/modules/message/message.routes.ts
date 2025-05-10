import express from 'express';
import { USER_ROLES } from '../../../enums/user';
import { MessageController } from './message.controller';
import fileUploadHandler from '../../middleware/fileUploadHandler';
import auth from '../../middleware/auth';
import parseData from '../../middleware/parseData';
import parseSingleFileData from '../../middleware/parseFileData';

const router = express.Router();

router.post(
  '/',
  fileUploadHandler(),
  parseSingleFileData,
  auth(USER_ROLES.ADMIN, USER_ROLES.USER, USER_ROLES.SUPER_ADMIN),
  MessageController.sendMessage,
);
router.get(
  '/:id',
  auth(USER_ROLES.ADMIN, USER_ROLES.USER, USER_ROLES.SUPER_ADMIN),
  MessageController.getMessage,
);

export const MessageRoutes = router;
