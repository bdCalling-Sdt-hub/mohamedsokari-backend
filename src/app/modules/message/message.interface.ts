import { Types } from 'mongoose';

export interface IMessageData {
  chat: Types.ObjectId;
  message?: string;
  type: 'general' | 'special' | 'reply' | 'image';
  link?: string;
  image?: string;
  sender: Types.ObjectId;
}