import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  name:           string;
  email:          string;
  password?:      string;
  googleId?:      string;
  avatar?:        string;
  phone?:         string;
  role:           'tenant' | 'landlord' | 'admin';
  savedListings:  mongoose.Types.ObjectId[];
  isVerified:     boolean;
  pushTokens:     string[];
  createdAt:      Date;
  comparePassword(plain: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>({
  name:          { type: String, required: true, trim: true },
  email:         { type: String, required: true, unique: true, lowercase: true },
  password:      { type: String, minlength: 8, select: false },
  googleId:      { type: String, sparse: true },
  avatar:        { type: String },
  phone:         { type: String },
  role:          { type: String, enum: ['tenant', 'landlord', 'admin'], default: 'tenant' },
  savedListings: [{ type: Schema.Types.ObjectId, ref: 'Listing' }],
  isVerified:    { type: Boolean, default: false },
  pushTokens:    [{ type: String }],
}, { timestamps: true });

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

UserSchema.methods.comparePassword = async function (plain: string) {
  return bcrypt.compare(plain, this.password);
};

export default mongoose.model<IUser>('User', UserSchema);
