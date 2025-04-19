import express from 'express';
import auth from '../../middleware/auth';
import { USER_ROLES } from '../../../enums/user';
import { AccauntController } from './accaunt.controller';
import fileUploadHandler from '../../middleware/fileUploadHandler';
import parseMultipleFiledata from '../../middleware/parseMultipleFiledata';
const router = express.Router();

router.get('/', auth(USER_ROLES.USER), AccauntController.getMyListing);
router.patch(
  '/edit/:productId',
  auth(USER_ROLES.USER),
  fileUploadHandler(),
  parseMultipleFiledata,
  AccauntController.editMyListingProduct,
);
router.delete(
  '/delete/:productId',
  auth(USER_ROLES.USER),
  AccauntController.deleteMyListingProduct,
);
router.get('/', auth(USER_ROLES.USER), AccauntController.getMyListing);
export const AccauntRouter = router;
