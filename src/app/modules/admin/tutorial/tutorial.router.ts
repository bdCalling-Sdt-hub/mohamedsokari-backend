import { NextFunction, Request, Response, Router } from 'express';
import { TutorialController } from './tutorial.controller';
import fileUploadHandler from '../../../middleware/fileUploadHandler';
import auth from '../../../middleware/auth';
import { USER_ROLES } from '../../../../enums/user';
import { getSingleFilePath } from '../../../../shared/getFilePath';

const router = Router();
// Define the routes
router.post(
  '/',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  fileUploadHandler(),
  (req: Request, res: Response, next: NextFunction) => {
    const videoUrl = getSingleFilePath(req.files, 'video');
    const data = JSON.parse(req.body.data);
    req.body = { videoUrl, ...data };
    next();
  },
  TutorialController.createVideo,
);
router.get('/', TutorialController.getVideos);
router.put(
  '/:id',
  fileUploadHandler(),
  (req: Request, res: Response, next: NextFunction) => {
    const videoUrl = getSingleFilePath(req.files, 'video');
    const data = JSON.parse(req.body.data);
    req.body = { videoUrl, ...data };
    next();
  },
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  TutorialController.updateVideoById,
);
router.get(
  '/:id',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  TutorialController.getVideoById,
);
router.delete(
  '/:id',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  TutorialController.deleteVideo,
);

export const TutorialRouter = router;
