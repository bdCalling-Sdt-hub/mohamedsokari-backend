import { Request, Response, NextFunction } from 'express';
import { getMultipleFilesPath } from '../../shared/getFilePath';

const parseMultipleFiledata = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const images = getMultipleFilesPath(req.files, 'image');
    if (req.body.data) {
      const data = JSON.parse(req.body.data);
      req.body = { images, ...data };
    } else {
      req.body = { images };
    }
    next();
  } catch (error) {
    next(error);
  }
};

export default parseMultipleFiledata;
