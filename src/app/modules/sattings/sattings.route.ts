import express, { Request, Response } from 'express';
import { USER_ROLES } from '../../../enums/user';
import { settingsController } from './sattings.controller';
import auth from '../../middlewares/auth';

const SettingsRouter = express.Router();

SettingsRouter.post(
  '/',
  auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  settingsController.addSetting
)
  .get('/', settingsController.getSettings)
  .get('/privacy-policy', settingsController.getPrivacyPolicy)
  .get('/account-delete-policy', settingsController.getAccountDelete)
  .get('/support', settingsController.getSupport)
  .patch('/', settingsController.updateSetting);

export default SettingsRouter;
