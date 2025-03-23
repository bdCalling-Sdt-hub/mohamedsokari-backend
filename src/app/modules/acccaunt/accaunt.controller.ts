import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { AccauntService } from './accaunt.service';

const getMyListing = catchAsync(async (req, res) => {
  const { id }: any = req.user;
  const result = await AccauntService.getMyListingProduct(id, req.query);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    data: result.listing,
    pagination: result.meta,
  });
});
const getMyPercess = catchAsync(async (req, res) => {
  const { id }: any = req.user;
  //   const result = await AccauntService.getMyListing(id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    // data: result,
  });
});

export const AccauntController = {
  getMyListing,
  getMyPercess,
};
