import { model, Schema } from 'mongoose';
import { IReport, ReportModel } from './report.interface';

const reportSchema = new Schema<IReport, ReportModel>(
  {
    customerId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    sellerId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    image: {
      type: String,
      required: true,
      ref: 'User',
    },
    type: {
      type: String,
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ['under review', 'resolved'],
      default: 'under review',
    },
  },
  { timestamps: true },
);

//check user
// reportSchema.pre('save', async function (next) {
//   const report = this as IReport;

//   const updatedReservation = await Reservation.findOneAndUpdate(
//     { _id: report.reservation },
//     { isReported: true },
//     { new: true },
//   );

//   if (!updatedReservation) {
//     return next(new AppError(StatusCodes.BAD_REQUEST, 'Reservation Not Found'));
//   }

//   next();
// });

export const Report = model<IReport, ReportModel>('Report', reportSchema);
