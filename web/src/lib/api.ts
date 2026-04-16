import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  },
);

// ── Listing queries ───────────────────────────────────────────────────────────
export interface ListingFilters {
  city?:       string;
  type?:       string;
  minPrice?:   number;
  maxPrice?:   number;
  bedrooms?:   number;
  furnished?:  boolean;
  amenities?:  string;
  search?:     string;
  sort?:       string;
  page?:       number;
  limit?:      number;
  featured?:   boolean;
}

export const listingsApi = {
  getAll:   (filters: ListingFilters) => api.get('/listings', { params: filters }),
  getOne:   (slug: string)            => api.get(`/listings/${slug}`),
  getMy:    ()                        => api.get('/listings/my'),
  getSaved: ()                        => api.get('/listings/saved'),
  create:   (data: FormData)          => api.post('/listings', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update:   (id: string, data: FormData) => api.put(`/listings/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete:   (id: string)              => api.delete(`/listings/${id}`),
  save:     (id: string)              => api.post(`/listings/${id}/save`),
};

export const authApi = {
  register: (data: any) => api.post('/auth/register', data),
  login:    (data: any) => api.post('/auth/login', data),
  google:   (idToken: string) => api.post('/auth/google', { idToken }),
  me:       ()          => api.get('/auth/me'),
  update:   (data: any) => api.put('/auth/profile', data),
};

export const bookingsApi = {
  create: (data: any) => api.post('/bookings', data),
  getAll: ()          => api.get('/bookings'),
  updateStatus: (id: string, status: string) => api.put(`/bookings/${id}/status`, { status }),
};

export const adminApi = {
  dashboard:    ()           => api.get('/admin/dashboard'),
  users:        (p?: any)    => api.get('/admin/users', { params: p }),
  listings:     (p?: any)    => api.get('/admin/listings', { params: p }),
  featureListing: (id: string, days: number) => api.put(`/admin/listings/${id}/feature`, { days }),
  updateUser:   (id: string, data: any) => api.put(`/admin/users/${id}`, data),
  deleteUser:   (id: string) => api.delete(`/admin/users/${id}`),
};
