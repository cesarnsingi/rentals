import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE } from '../constants';

export const api = axios.create({ baseURL: API_BASE });

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  async (err) => {
    if (err.response?.status === 401) {
      await AsyncStorage.removeItem('token');
    }
    return Promise.reject(err);
  },
);

export const listingsApi = {
  getAll:   (params?: any) => api.get('/listings', { params }),
  getOne:   (slug: string) => api.get(`/listings/${slug}`),
  getMy:    ()             => api.get('/listings/my'),
  getSaved: ()             => api.get('/listings/saved'),
  save:     (id: string)   => api.post(`/listings/${id}/save`),
};

export const authApi = {
  register: (data: any) => api.post('/auth/register', data),
  login:    (data: any) => api.post('/auth/login', data),
  me:       ()          => api.get('/auth/me'),
  savePushToken: (token: string) => api.post('/auth/push-token', { token }),
};

export const bookingsApi = {
  create:       (data: any)                       => api.post('/bookings', data),
  getAll:       ()                                => api.get('/bookings'),
  updateStatus: (id: string, status: string)      => api.put(`/bookings/${id}/status`, { status }),
};
