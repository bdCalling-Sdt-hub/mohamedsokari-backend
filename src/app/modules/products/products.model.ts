import mongoose, { model, Schema } from 'mongoose';
import { IProduct } from './products.interface';


// Item Schema Definition
const productsSchema = new Schema<IProduct>(
  {
    sellerId: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
    buyerId: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: false,
      default: null,
    },
    title: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    description: { type: String, required: true },
    additionalInfo: { type: String, default: '' },
    location: { type: String, required: true },
    totalViews: { type: Number, default: 0 },
    liked: { type: Number, default: 0 },
    countAddToCart: { type: Number, default: 0 },
    condition: {
      type: String,
      enum: ['Used but Good Conditions', 'Well Used'],
      required: true,
    },
    isDeleted: { type: Boolean, default: false },
    images: { type: [String], required: true },
    status: {
      type: String,
      enum: ['available', 'sold'],
      default: 'available',
    },
  },

  {
    timestamps: true,
  },
);

// Query Middleware
productsSchema.pre('find', function (next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

productsSchema.pre('findOne', function (next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

productsSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { isDeleted: { $ne: true } } });
  next();
});

const Product = model<IProduct>('Product', productsSchema);

export default Product;
