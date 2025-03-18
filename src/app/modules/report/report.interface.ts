import { Model, Types } from "mongoose";

export type IReport = {
    customer: Types.ObjectId;
    seller: Types.ObjectId;
    reason: [];
};

export type ReportModel = Model<IReport, Record<string, unknown>>;