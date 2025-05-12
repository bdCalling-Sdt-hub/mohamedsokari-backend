import express from 'express';
import { USER_ROLES } from '../../../../enums/user';
import auth from '../../../middleware/auth';
import { DashboardProductController } from './product.controller';

const router = express.Router();
router.get(
  '/',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  DashboardProductController.getAllProducts,
);
router.get(
  '/product-stats',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  DashboardProductController.getProductStatistics,
);
router.get(
  '/top-district',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  DashboardProductController.getTopDistricts,
);
router.get(
  '/top-category',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  DashboardProductController.getTopCategory,
);
router.get(
  '/:id',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  DashboardProductController.getSingleProduct,
);
router.delete(
  '/:id',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  DashboardProductController.deleteProduct,
);
router.post(
  '/delete-multiple',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  DashboardProductController.deleteMultipleProducts,
);

export const DashboardProductRouter = router;
