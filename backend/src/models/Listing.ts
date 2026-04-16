import mongoose, { Schema, Document } from 'mongoose';

export interface IListing extends Document {
  title:        string;
  slug:         string;
  description:  string;
  type:         'apartment' | 'house' | 'villa' | 'studio' | 'commercial' | 'room';
  status:       'available' | 'rented' | 'pending' | 'inactive';
  price:        number;
  pricePeriod:  'month' | 'week' | 'day';
  currency:     'AOA' | 'USD';
  bedrooms:     number;
  bathrooms:    number;
  area:         number;
  floor?:       number;
  totalFloors?: number;
  furnished:    boolean;
  amenities:    string[];
  images:       { url: string; publicId: string }[];
  location: {
    city:         string;
    district:     string;
    address:      string;
    coordinates:  { lat: number; lng: number };
  };
  landlord:    mongoose.Types.ObjectId;
  viewCount:   number;
  featured:    boolean;
  featureUntil?: Date;
  contactPhone?: string;
  contactWhatsApp?: string;
  contactEmail?: string;
  createdAt:   Date;
  updatedAt:   Date;
}

const ListingSchema = new Schema<IListing>({
  title:       { type: String, required: true, trim: true, maxlength: 120 },
  slug:        { type: String, unique: true },
  description: { type: String, required: true, maxlength: 3000 },
  type:        { type: String, enum: ['apartment','house','villa','studio','commercial','room'], required: true },
  status:      { type: String, enum: ['available','rented','pending','inactive'], default: 'available' },
  price:       { type: Number, required: true, min: 0 },
  pricePeriod: { type: String, enum: ['month','week','day'], default: 'month' },
  currency:    { type: String, enum: ['AOA','USD'], default: 'AOA' },
  bedrooms:    { type: Number, default: 0, min: 0 },
  bathrooms:   { type: Number, default: 1, min: 0 },
  area:        { type: Number, min: 0 },
  floor:       { type: Number },
  totalFloors: { type: Number },
  furnished:   { type: Boolean, default: false },
  amenities:   [{ type: String }],
  images: [{
    url:       { type: String, required: true },
    publicId:  { type: String, required: true },
  }],
  location: {
    city:        { type: String, required: true },
    district:    { type: String },
    address:     { type: String, required: true },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number },
    },
  },
  landlord:         { type: Schema.Types.ObjectId, ref: 'User', required: true },
  viewCount:        { type: Number, default: 0 },
  featured:         { type: Boolean, default: false },
  featureUntil:     { type: Date },
  contactPhone:     { type: String },
  contactWhatsApp:  { type: String },
  contactEmail:     { type: String },
}, { timestamps: true });

// Text search index
ListingSchema.index({ title: 'text', description: 'text', 'location.city': 'text', 'location.district': 'text' });
ListingSchema.index({ 'location.city': 1, status: 1, price: 1 });
ListingSchema.index({ landlord: 1, status: 1 });
ListingSchema.index({ featured: -1, createdAt: -1 });

export default mongoose.model<IListing>('Listing', ListingSchema);
