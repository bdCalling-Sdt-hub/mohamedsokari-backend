import express from 'express';
import { DashboardController } from './dashboard.controller';
import auth from '../../middleware/auth';
import { USER_ROLES } from '../../../enums/user';

const router = express.Router();
router.get(
  '/',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  DashboardController.totalAnalysis,
);
router.get(
  '/revenue',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  DashboardController.totalRevenue,
);
export const DashboardRouter = router;
