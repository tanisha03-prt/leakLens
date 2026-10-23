import mongoose, { Schema, Document } from 'mongoose';

export interface IBuildingDocument extends Document {
  name: string;
  code: string;
  type: 'hostel' | 'academic' | 'residential' | 'faculty';
  totalFloors: number;
  totalRooms: number;
  wings: string[];
  hotspotScore: number;
  createdAt: Date;
  updatedAt: Date;
}

const BuildingSchema = new Schema<IBuildingDocument>(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true, index: true },
    type: { 
      type: String, 
      enum: ['hostel', 'academic', 'residential', 'faculty'], 
      required: true 
    },
    totalFloors: { type: Number, required: true, min: 1, max: 50 },
    totalRooms: { type: Number, required: true, min: 1 },
    wings: [{ type: String, trim: true }],
    hotspotScore: { type: Number, default: 0, min: 0, max: 100 }
  },
  { timestamps: true }
);

BuildingSchema.index({ type: 1 });

export const Building = mongoose.models.Building || mongoose.model<IBuildingDocument>('Building', BuildingSchema);
export default Building;
