import { StatusCodes } from 'http-status-codes';
import { IVideo } from './tutorial.inetrface';
import AppError from '../../../../errors/AppError';
import { Tutorial } from './tutorial.model';
import unlinkFile from '../../../../shared/unlinkFile';

// Create a new video and save to the database
const createVideoToDB = async (payload: IVideo): Promise<IVideo> => {
  const createVideo: any = await Tutorial.create(payload);

  if (!createVideo) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Failed to create video');
  }
  return createVideo;
};

// Delete a video from the database by its ID
const deleteVideoFromDB = async (id: string): Promise<IVideo | undefined> => {
  const isExistVideo = await Tutorial.findByIdAndDelete(id);
  if (!isExistVideo) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Failed to delete video');
  }
  return isExistVideo;
};

// Get all videos from the database
const getVideosFromDB = async (): Promise<IVideo[]> => {
  const tutorial = await Tutorial.find({});
  if (!tutorial) {
    throw new AppError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Failed to fetch videos',
    );
  }
  return tutorial;
};
// get video by id 
const getVideoById = async (id: string) => {
  const tutorial = await Tutorial.findById(id);
  if (!tutorial) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Video not found');
  }
  return tutorial;
};
// \udpate video by id 
const updateVideoById = async (id: string, payload: IVideo) => {
  const ifExistVideo = await Tutorial.findById(id);
  if (!ifExistVideo) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Video not found');
  }
  if (payload.videoUrl && ifExistVideo.videoUrl) {
    unlinkFile(ifExistVideo.videoUrl);
  }
  const tutorial = await Tutorial.findByIdAndUpdate(
    id,
    { $set: { ...payload } },
    { new: true },
  );
  if (!tutorial) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Video not found');
  }
  return tutorial;
};

export const TutorialService = {
  createVideoToDB,
  deleteVideoFromDB,
  getVideosFromDB,
  getVideoById,
  updateVideoById,
};
