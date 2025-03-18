import { Schema } from 'mongoose';

export interface IProduct {
  sellerId: Schema.Types.ObjectId;
  title: string;
  price: number;
  category: string;
  description: string;
  location: string;
  totalViews: number;
  condition: 'good' | 'well';
  images: string[];
  status: 'available' | 'sold';
  isDeleted?: boolean;
}
