import mongoose, { Schema } from 'mongoose';
import { IVideo } from './tutorial.inetrface';

const videoSchema: Schema = new Schema<IVideo>(
  {
    title: { type: String, required: true },
    videoUrl: { type: String, required: true },
  },
  { timestamps: true },
);

export const Tutorial = mongoose.model<IVideo>('Tutorial', videoSchema);
