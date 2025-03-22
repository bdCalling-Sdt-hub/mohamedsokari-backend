import { StatusCodes } from 'http-status-codes';
import { IReport } from './report.interface';
import { Report } from './report.model';
import AppError from '../../../errors/AppError';

const createReportToDB = async (payload: IReport): Promise<IReport> => {
  const report = await Report.create(payload);
  if (!report)
    throw new AppError(StatusCodes.BAD_REQUEST, 'Failed to created Report ');
  return report;
};
// Get all reports
const getAllReports = async (): Promise<IReport[]> => {
  const reports = await Report.find();
  if (!reports) {
    throw new AppError(StatusCodes.NOT_FOUND, 'No reports found');
  }
  return reports;
};

// Get a report by ID
const getReportById = async (reportId: string): Promise<IReport | null> => {
  const report = await Report.findById(reportId);
  if (!report) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Report not found');
  }
  return report;
};
// Update report status
const updateReportStatus = async (
  reportId: string,
  status: string,
): Promise<IReport> => {
  if (!status || !['under review', 'resolved'].includes(status)) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid status value');
  }
  const updatedReport = await Report.findByIdAndUpdate(
    reportId,
    { status },
    { new: true },
  );

  if (!updatedReport) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Report not found');
  }
  return updatedReport;
};
// Delete a report
const deleteReport = async (reportId: string): Promise<void> => {
    const deletedReport = await Report.findByIdAndDelete(reportId);
  
    if (!deletedReport) {
      throw new AppError(StatusCodes.NOT_FOUND, 'Report not found');
    }
  };
  
export const ReportService = {
  createReportToDB,
  getAllReports,
  getReportById,
  updateReportStatus,
  deleteReport
};
