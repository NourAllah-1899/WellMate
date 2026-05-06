import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Replace with your local machine's IP address and backend port
export const API_URL = 'http://192.168.0.109:5000/api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach the token to every request
apiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;

// Exported helper functions using the axios instance
export const getEvents = async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await apiClient.get(`/events?${query}`);
    return res.data;
};

export const getMyEvents = async () => {
    const res = await apiClient.get('/events/me/all');
    return res.data;
};

export const createEvent = async (data: any) => {
    const res = await apiClient.post('/events', data);
    return res.data;
};

export const joinEvent = async (eventId: any) => {
    const res = await apiClient.post(`/events/${eventId}/join`);
    return res.data;
};

export const leaveEvent = async (eventId: any) => {
    const res = await apiClient.delete(`/events/${eventId}/join`);
    return res.data;
};

export const deleteEvent = async (eventId: any) => {
    const res = await apiClient.delete(`/events/${eventId}`);
    return res.data;
};

export const updateEvent = async (eventId: any, data: any) => {
    const res = await apiClient.put(`/events/${eventId}`, data);
    return res.data;
};
