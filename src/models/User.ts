import mongoose, { Schema, Document } from 'mongoose';

export interface IUserDocument extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: 'resident' | 'maintenance' | 'admin';
  phone?: string;
  roomNumber?: string;
  buildingId?: mongoose.Types.ObjectId | string;
  department?: string;
  specialty?: string;
  status: 'active' | 'inactive';
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUserDocument>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: true },
    role: { 
      type: String, 
      enum: ['resident', 'maintenance', 'admin'], 
      default: 'resident',
      required: true,
      index: true
    },
    phone: { type: String, trim: true },
    roomNumber: { type: String, trim: true },
    buildingId: { type: Schema.Types.Mixed, ref: 'Building' },
    department: { type: String, trim: true },
    specialty: { type: String, trim: true },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    avatar: { type: String }
  },
  { timestamps: true }
);

UserSchema.index({ role: 1, status: 1 });

export const User = mongoose.models.User || mongoose.model<IUserDocument>('User', UserSchema);
export default User;
