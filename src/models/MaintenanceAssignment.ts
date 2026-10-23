import mongoose, { Schema, Document } from 'mongoose';

export interface IMaintenanceAssignmentDocument extends Document {
  leakReportId: mongoose.Types.ObjectId | string;
  technicianId: mongoose.Types.ObjectId | string;
  technicianName: string;
  status: 'pending' | 'in_progress' | 'parts_ordered' | 'completed';
  assignedBy: mongoose.Types.ObjectId | string;
  notes?: string;
  resolutionSummary?: string;
  partsUsed: string[];
  evidencePhotoUrl?: string;
  waterValveConfirmedClosed: boolean;
  workHoursLogged: number;
  assignedAt: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const MaintenanceAssignmentSchema = new Schema<IMaintenanceAssignmentDocument>(
  {
    leakReportId: { type: Schema.Types.Mixed, ref: 'LeakReport', required: true, index: true },
    technicianId: { type: Schema.Types.Mixed, ref: 'User', required: true, index: true },
    technicianName: { type: String, required: true },
    status: { 
      type: String, 
      enum: ['pending', 'in_progress', 'parts_ordered', 'completed'], 
      default: 'pending',
      index: true
    },
    assignedBy: { type: Schema.Types.Mixed, ref: 'User', required: true },
    notes: { type: String, trim: true },
    resolutionSummary: { type: String, trim: true },
    partsUsed: [{ type: String, trim: true }],
    evidencePhotoUrl: { type: String },
    waterValveConfirmedClosed: { type: Boolean, default: false },
    workHoursLogged: { type: Number, default: 0, min: 0 },
    assignedAt: { type: Date, default: Date.now },
    completedAt: { type: Date }
  },
  { timestamps: true }
);

MaintenanceAssignmentSchema.index({ technicianId: 1, status: 1 });

export const MaintenanceAssignment = mongoose.models.MaintenanceAssignment || mongoose.model<IMaintenanceAssignmentDocument>('MaintenanceAssignment', MaintenanceAssignmentSchema);
export default MaintenanceAssignment;
