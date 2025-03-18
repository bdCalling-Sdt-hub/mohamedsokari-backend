import { Request } from 'express';
import fs from 'fs';
import { StatusCodes } from 'http-status-codes';
import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import AppError from '../../errors/AppError';

const fileUploadHandler = () => {
  //create upload folder
  const baseUploadDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(baseUploadDir)) {
    fs.mkdirSync(baseUploadDir);
  }

  //folder create for different file
  const createDir = (dirPath: string) => {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath);
    }
  };

  //create filename
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      let uploadDir;
      switch (file.fieldname) {
        case 'image':
          uploadDir = path.join(baseUploadDir, 'image');
          break;
        case 'banner':
          uploadDir = path.join(baseUploadDir, 'banner');
          break;
        case 'logo':
          uploadDir = path.join(baseUploadDir, 'logo');
          break;
        case 'audio':
          uploadDir = path.join(baseUploadDir, 'audio');
          break;
        case 'video':
          uploadDir = path.join(baseUploadDir, 'video');
          break;
        default:
          throw new AppError(StatusCodes.BAD_REQUEST, 'File is not supported');
      }
      createDir(uploadDir);
      cb(null, uploadDir);
    },

    filename: (req, file, cb) => {
      const fileExt = path.extname(file.originalname);
      const fileName =
        file.originalname
          .replace(fileExt, '')
          .toLowerCase()
          .split(' ')
          .join('-') +
        '-' +
        Date.now();
      cb(null, fileName + fileExt);
    },
  });

  //file filter
  const filterFilter = (req: Request, file: any, cb: FileFilterCallback) => {
    if (
      file.fieldname === 'image' ||
      file.fieldname === 'logo' ||
      file.fieldname === 'banner'
    ) {
      if (
        file.mimetype === 'image/png' ||
        file.mimetype === 'image/jpg' ||
        file.mimetype === 'image/jpeg' ||
        file.mimetype === 'image/svg' ||
        file.mimetype === 'image/webp' ||
        file.mimetype === 'application/octet-stream' ||
        file.mimetype === 'image/svg+xml'
      ) {
        cb(null, true);
      } else {
        cb(
          new AppError(
            StatusCodes.BAD_REQUEST,
            'Only .jpeg, .png, .jpg .svg .webp .octet-stream .svg+xml file supported',
          ),
        );
      }
    } else if (file.fieldname === 'audio') {
      if (
        file.mimetype === 'audio/mpeg' ||
        file.mimetype === 'audio/mp3' ||
        file.mimetype === 'audio/wav' ||
        file.mimetype === 'audio/ogg' ||
        file.mimetype === 'audio/webm'
      ) {
        cb(null, true);
      } else {
        cb(
          new AppError(
            StatusCodes.BAD_REQUEST,
            'Only .mp3, .wav, .ogg, .webm audio files are supported',
          ),
        );
      }
    } else if (file.fieldname === 'video') {
      if (
        file.mimetype === 'video/mp4' ||
        file.mimetype === 'video/webm' ||
        file.mimetype === 'video/quicktime' ||
        file.mimetype === 'video/x-msvideo' ||
        file.mimetype === 'video/x-matroska' ||
        file.mimetype === 'video/mpeg'
      ) {
        cb(null, true);
      } else {
        cb(
          new AppError(
            StatusCodes.BAD_REQUEST,
            'Only .mp4, .webm, .mov, .avi, .mkv, .mpeg video files are supported',
          ),
        );
      }
    } else {
      cb(new AppError(StatusCodes.BAD_REQUEST, 'This file is not supported'));
    }
  };

  const upload = multer({
    storage: storage,
    limits: {
      fileSize: 100 * 1024 * 1024,
    },
    fileFilter: filterFilter,
  }).fields([
    { name: 'image', maxCount: 10 },
    { name: 'logo', maxCount: 5 },
    { name: 'banner', maxCount: 5 },
    { name: 'audio', maxCount: 5 },
    { name: 'video', maxCount: 5 },
  ]);
  return upload;
};

export default fileUploadHandler;
