
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { getChatByParticipantId } from './chat.service';

const getAllChats = catchAsync(async (req, res) => {
  const options = {
    limit: Number(req.query.limit) || 10,
    page: Number(req.query.page) || 1,
  };
  const { userId } = req.user;
  // console.log('userId=====================', userId);
  const filter: any = { participantId: userId };

  const search = req.query.search;
  // console.log('serch', search);

  if (search && search !== 'null' && search !== '' && search !== undefined) {
    const searchRegExp = new RegExp('.*' + search + '.*', 'i');
    filter.name = searchRegExp;
    // filter._id = search;
  }
  //  const { userId } = req.user;
  // // console.log({ filter });
  // // console.log({ options });

  const result = await getChatByParticipantId(filter, options);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    //    meta: meta,
    data: result,
    message: 'chat list get successfully!',
  });
});

export const chatController = {
  getAllChats,
};
