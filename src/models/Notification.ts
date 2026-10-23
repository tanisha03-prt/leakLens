import mongoose, { Schema, Document } from 'mongoose';

export interface INotificationDocument extends Document {
  userId?: mongoose.Types.ObjectId | string;
  roleTarget: 'resident' | 'maintenance' | 'admin' | 'all';
  title: string;
  message: string;
  type: 'urgent' | 'assignment' | 'resolved' | 'sla_breach' | 'duplicate';
  ticketId?: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotificationDocument>(
  {
    userId: { type: Schema.Types.Mixed, ref: 'User', index: true },
    roleTarget: { 
      type: String, 
      enum: ['resident', 'maintenance', 'admin', 'all'], 
      default: 'all',
      index: true 
    },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    type: { 
      type: String, 
      enum: ['urgent', 'assignment', 'resolved', 'sla_breach', 'duplicate'], 
      default: 'urgent',
      index: true
    },
    ticketId: { type: String, trim: true },
    isRead: { type: Boolean, default: false, index: true }
  },
  { timestamps: true }
);

export const Notification = mongoose.models.Notification || mongoose.model<INotificationDocument>('Notification', NotificationSchema);
export default Notification;
