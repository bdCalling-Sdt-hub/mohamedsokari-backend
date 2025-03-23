import express from 'express';
import auth from '../../middleware/auth';
import { USER_ROLES } from '../../../enums/user';
import { AccauntController } from './accaunt.controller';
const router = express.Router();

router.get('/', auth(USER_ROLES.USER), AccauntController.getMyListing);
export const AccauntRouter = router;
