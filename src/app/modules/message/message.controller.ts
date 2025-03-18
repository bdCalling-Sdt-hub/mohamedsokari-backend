import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { messageService } from './message.service';
import { Types } from 'mongoose';
import AppError from '../../../errors/AppError';
import { getSingleFilePath } from '../../../shared/getFilePath';

// get all messages
const getAllMessages = catchAsync(async (req, res) => {
  const options = {
    page: req.query.page || 1,
    limit: Number(req.query.limit) || 10,
  };
  const chatId = req.query.chatId;
  // console.log({ chatIdController: chatId });
  if (!chatId) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'ChatId is required in params');
  }
  const result = await messageService.getMessages(chatId, options);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'message retrive successful!',
    data: result,
  });
});

// upload image message
const uploadImage = catchAsync(async (req, res) => {
  console.log(req.body);
  const { chatId, senderId } = req.body;

  if (!chatId || !senderId) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      'Chat ID and Sender ID are required',
    );
  }

  // Get the uploaded image
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };

  if (!files || !files.image || files.image.length === 0) {
    throw new AppError(StatusCodes.NOT_FOUND, 'No image uploaded');
  }

  // Convert path to relative URL
  const imageUrl = getSingleFilePath(files, 'image');

  // Create a new message with the image
  const result = await messageService.addImageMessage({
    chat: new Types.ObjectId(chatId),
    sender: new Types.ObjectId(senderId),
    type: 'image',
    image: `${imageUrl}`,
  });

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.CREATED,
    data: result,
    message: 'Image message created successfully!',
  });
});

// upload audio message
const uploadAudio = catchAsync(async (req, res) => {
  const { chatId, senderId } = req.body;

  if (!chatId || !senderId) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      'Chat ID and Sender ID are required',
    );
  }

  // Get the uploaded audio
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };

  if (!files || !files.audio || files.audio.length === 0) {
    throw new AppError(StatusCodes.NOT_FOUND, 'No audio uploaded');
  }

  // Convert path to relative URL
  const audioUrl = getSingleFilePath(files, 'audio');

  // Create a new message with the audio
  const result = await messageService.addAudioMessage({
    chat: new Types.ObjectId(chatId),
    sender: new Types.ObjectId(senderId),
    type: 'audio',
    audio: `${audioUrl}`,
  });

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.CREATED,
    data: result,
    message: 'Audio message created successfully!',
  });
});

export const messageController = {
  getAllMessages,
  uploadImage,
  uploadAudio,
};