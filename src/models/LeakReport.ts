import mongoose, { Schema, Document } from 'mongoose';

export interface ILeakReportDocument extends Document {
  ticketNumber: string;
  title: string;
  description: string;
  buildingId: mongoose.Types.ObjectId | string;
  buildingName: string;
  floor: number;
  roomOrZone: string;
  plumbingShaftOrRiser?: string;
  severity: 'minor' | 'moderate' | 'severe' | 'critical';
  leakType: 'faucet' | 'pipe_joint' | 'ceiling_seepage' | 'flush_valve' | 'drain_overflow' | 'geyser_heater' | 'main_riser';
  status: 'reported' | 'assigned' | 'in_progress' | 'resolved' | 'closed';
  
  reportedBy: {
    userId: mongoose.Types.ObjectId | string;
    name: string;
    role: string;
    contact?: string;
  };
  
  photoUrl: string;
  resolutionPhotoUrl?: string;
  
  leakRateLph: number; // Liters per hour
  isEstimatedRate: boolean;
  waterLossLiters: number;
  costLostINR: number;
  
  riskScore: number;
  isRecurring: boolean;
  recurrenceCount: number;
  isDuplicateFlagged: boolean;
  duplicateOfTicketId?: string;
  
  assignment?: {
    assignedToId?: mongoose.Types.ObjectId | string;
    technicianName?: string;
    assignedAt?: Date;
    startedAt?: Date;
    estimatedCompletionTime?: Date;
    notes?: string;
    partsReplaced?: string[];
    waterValveShutOff?: boolean;
    hoursSpent?: number;
  };
  
  reportedAt: Date;
  resolvedAt?: Date;
  closedAt?: Date;
  slaBreach: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const LeakReportSchema = new Schema<ILeakReportDocument>(
  {
    ticketNumber: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    buildingId: { type: Schema.Types.Mixed, ref: 'Building', required: true, index: true },
    buildingName: { type: String, required: true },
    floor: { type: Number, required: true, index: true },
    roomOrZone: { type: String, required: true, trim: true, index: true },
    plumbingShaftOrRiser: { type: String, trim: true, index: true },
    severity: { 
      type: String, 
      enum: ['minor', 'moderate', 'severe', 'critical'], 
      required: true,
      index: true 
    },
    leakType: { 
      type: String, 
      enum: ['faucet', 'pipe_joint', 'ceiling_seepage', 'flush_valve', 'drain_overflow', 'geyser_heater', 'main_riser'], 
      required: true,
      index: true 
    },
    status: { 
      type: String, 
      enum: ['reported', 'assigned', 'in_progress', 'resolved', 'closed'], 
      default: 'reported',
      index: true 
    },
    reportedBy: {
      userId: { type: Schema.Types.Mixed, ref: 'User', required: true, index: true },
      name: { type: String, required: true },
      role: { type: String, required: true },
      contact: { type: String }
    },
    photoUrl: { type: String, required: true },
    resolutionPhotoUrl: { type: String },
    
    leakRateLph: { type: Number, default: 0.8 },
    isEstimatedRate: { type: Boolean, default: true },
    waterLossLiters: { type: Number, default: 0 },
    costLostINR: { type: Number, default: 0 },
    
    riskScore: { type: Number, default: 20, min: 1, max: 100, index: true },
    isRecurring: { type: Boolean, default: false, index: true },
    recurrenceCount: { type: Number, default: 0 },
    isDuplicateFlagged: { type: Boolean, default: false },
    duplicateOfTicketId: { type: String },
    
    assignment: {
      assignedToId: { type: Schema.Types.Mixed, ref: 'User' },
      technicianName: { type: String },
      assignedAt: { type: Date },
      startedAt: { type: Date },
      estimatedCompletionTime: { type: Date },
      notes: { type: String },
      partsReplaced: [{ type: String }],
      waterValveShutOff: { type: Boolean, default: false },
      hoursSpent: { type: Number, default: 0 }
    },
    
    reportedAt: { type: Date, default: Date.now, index: true },
    resolvedAt: { type: Date },
    closedAt: { type: Date },
    slaBreach: { type: Boolean, default: false }
  },
  { timestamps: true }
);

// Compound indexes for fast geospatial/hotspot queries and duplicate checking
LeakReportSchema.index({ buildingId: 1, floor: 1, roomOrZone: 1, status: 1 });
LeakReportSchema.index({ buildingId: 1, plumbingShaftOrRiser: 1 });
LeakReportSchema.index({ status: 1, severity: 1, reportedAt: -1 });

export const LeakReport = mongoose.models.LeakReport || mongoose.model<ILeakReportDocument>('LeakReport', LeakReportSchema);
export default LeakReport;
