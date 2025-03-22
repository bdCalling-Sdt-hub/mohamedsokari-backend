export interface IProduct {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
}
export interface IOrder {
  id: string;
  items: IProduct;
  totalPrice: number;
  status: string;
  customerId: string;
  createdAt: Date;
  updatedAt: Date;
  confirmBybyer: boolean;
  confirmByseller: boolean;
  paymentMethod: string;
  shippingAddress: string;
  paymentId: string;
  isPaid: boolean;
}
