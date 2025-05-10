import express from 'express';
import { DashboardUserController } from './userManagment.controller';
import auth from '../../../middleware/auth';
import { USER_ROLES } from '../../../../enums/user';
import validateRequest from '../../../middleware/validateRequest';
import { userManagmentValidations } from './userManagment.validation';

const router = express.Router();

router.get(
  '/',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  DashboardUserController.getAllUser,
);
router.get(
  '/seller-history/:userId',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  DashboardUserController.getSellsHistory,
);
router.get(
  '/buyer-history/:userId',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  DashboardUserController.getBuyerHistory,
);
router.get(
  '/user-analytics',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  DashboardUserController.getUserAnalytics,
);
router.get(
  '/top-districts',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  DashboardUserController.getTopDistricts,
);
router.get(
  '/:id',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  DashboardUserController.getSingleUser,
);
router.put(
  '/status/:id',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  validateRequest(userManagmentValidations.updateStatus),
  DashboardUserController.updateStatus,
);

export const DashboardUserRouter = router;
