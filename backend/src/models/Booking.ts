import mongoose, { Schema, Document } from 'mongoose';

export interface IBooking extends Document {
  listing:    mongoose.Types.ObjectId;
  tenant:     mongoose.Types.ObjectId;
  landlord:   mongoose.Types.ObjectId;
  startDate:  Date;
  endDate:    Date;
  totalPrice: number;
  currency:   'AOA' | 'USD';
  status:     'pending' | 'confirmed' | 'cancelled' | 'completed';
  message:    string;
  createdAt:  Date;
}

const BookingSchema = new Schema<IBooking>({
  listing:    { type: Schema.Types.ObjectId, ref: 'Listing', required: true },
  tenant:     { type: Schema.Types.ObjectId, ref: 'User',    required: true },
  landlord:   { type: Schema.Types.ObjectId, ref: 'User',    required: true },
  startDate:  { type: Date, required: true },
  endDate:    { type: Date, required: true },
  totalPrice: { type: Number, required: true },
  currency:   { type: String, enum: ['AOA','USD'], default: 'AOA' },
  status:     { type: String, enum: ['pending','confirmed','cancelled','completed'], default: 'pending' },
  message:    { type: String, maxlength: 500 },
}, { timestamps: true });

BookingSchema.index({ tenant: 1, status: 1 });
BookingSchema.index({ landlord: 1, status: 1 });
BookingSchema.index({ listing: 1 });

export default mongoose.model<IBooking>('Booking', BookingSchema);
