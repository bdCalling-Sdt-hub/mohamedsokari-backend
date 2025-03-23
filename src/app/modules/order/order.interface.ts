import { Types } from 'mongoose';

export interface IOrder {
  productId: Types.ObjectId;
  customerId: Types.ObjectId;
  totalPrice: number;
  status: string;
  confirmBybyer: boolean;
  confirmByseller: boolean;
  orderNumber: string;
  isPaid: boolean;
}
