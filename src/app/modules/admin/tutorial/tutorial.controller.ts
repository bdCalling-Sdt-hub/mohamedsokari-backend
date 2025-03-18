import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../../shared/catchAsync';
import sendResponse from '../../../../shared/sendResponse';
import { TutorialService } from './tutorial.service';

// Create a new video
const createVideo = catchAsync(async (req, res) => {
  const payload = req.body;
  const result = await TutorialService.createVideoToDB(payload);

  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Video created successfully',
    data: result,
  });
});

// Delete a video by ID
const deleteVideo = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await TutorialService.deleteVideoFromDB(id);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Video deleted successfully',
    data: result,
  });
});

// Get all videos
const getVideos = catchAsync(async (req, res) => {
  const result = await TutorialService.getVideosFromDB();
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Videos retrieved successfully',
    data: result,
  });
});
const getVideoById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await TutorialService.getVideoById(id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Video retrieved successfully',
    data: result,
  });
});
const updateVideoById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  const result = await TutorialService.updateVideoById(id, updateData);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Video updated successfully',
    data: result,
  });
});

export const TutorialController = {
  createVideo,
  deleteVideo,
  getVideos,
  getVideoById,
  updateVideoById,
};
