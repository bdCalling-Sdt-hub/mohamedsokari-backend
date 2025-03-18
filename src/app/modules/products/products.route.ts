import express from 'express';
import { Productcontroller } from './products.controller';
import auth from '../../middleware/auth';
import { USER_ROLES } from '../../../enums/user';
import parseMultipleFiledata from '../../middleware/parseMultipleFiledata';
import validateRequest from '../../middleware/validateRequest';
import { ProductValidation } from './products.validation';
import fileUploadHandler from '../../middleware/fileUploadHandler';
const router = express.Router();

router.post(
  '/create',
  auth(USER_ROLES.USER),
  fileUploadHandler(),
  parseMultipleFiledata,
  validateRequest(ProductValidation.productValidationSchema),
  Productcontroller.addProduct,
);
router.get('/', Productcontroller.getAllProducts);
router.get('/:id', Productcontroller.getProduct);

export const ProductRouter = router;
