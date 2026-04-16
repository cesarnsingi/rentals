export interface User {
  id:           string;
  name:         string;
  email:        string;
  avatar?:      string;
  phone?:       string;
  role:         'tenant' | 'landlord' | 'admin';
  savedListings: string[];
  createdAt:    string;
}

export interface ListingImage {
  url:       string;
  publicId:  string;
}

export interface Location {
  city:        string;
  district:    string;
  address:     string;
  coordinates: { lat: number; lng: number };
}

export interface Listing {
  _id:             string;
  title:           string;
  slug:            string;
  description:     string;
  type:            'apartment' | 'house' | 'villa' | 'studio' | 'commercial' | 'room';
  status:          'available' | 'rented' | 'pending' | 'inactive';
  price:           number;
  pricePeriod:     'month' | 'week' | 'day';
  currency:        'AOA' | 'USD';
  bedrooms:        number;
  bathrooms:       number;
  area:            number;
  furnished:       boolean;
  amenities:       string[];
  images:          ListingImage[];
  location:        Location;
  landlord:        User | string;
  viewCount:       number;
  featured:        boolean;
  contactPhone?:   string;
  contactWhatsApp?: string;
  contactEmail?:   string;
  createdAt:       string;
}

export interface Booking {
  _id:        string;
  listing:    Listing;
  tenant:     User;
  landlord:   User;
  startDate:  string;
  endDate:    string;
  totalPrice: number;
  currency:   'AOA' | 'USD';
  status:     'pending' | 'confirmed' | 'cancelled' | 'completed';
  message:    string;
  createdAt:  string;
}

export interface ListingsResponse {
  listings:    Listing[];
  total:       number;
  page:        number;
  totalPages:  number;
}

export type SortOption = '-createdAt' | 'price' | '-price' | '-viewCount';

export interface FilterState {
  city:       string;
  type:       string;
  minPrice:   string;
  maxPrice:   string;
  bedrooms:   string;
  furnished:  string;
  amenities:  string[];
  search:     string;
  sort:       SortOption;
  page:       number;
}
