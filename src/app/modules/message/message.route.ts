import { Router } from 'express';
import { messageController } from './message.controller';
import fileUploadHandler from '../../middleware/fileUploadHandler';
import parseSingleFileData from '../../middleware/parseFileData';
const router = Router();

// router
router.get('/', messageController.getAllMessages);
router.post(
  '/upload-image',
  fileUploadHandler(),
  parseSingleFileData,
  messageController.uploadImage,
);
router.post(
  '/upload-audio',
  fileUploadHandler(),
  parseSingleFileData,
  messageController.uploadAudio,
);
export const MessageRouter = router;
