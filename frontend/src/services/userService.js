import api from './api';
import { normalizeShop, normalizeSummary } from '../utils/normalizers';

export const userService = {
  async login(credentials) {
    const data = await api.post('users/login/', credentials);
    return normalizeShop(data);
  },
  async register(payload) {
    return api.post('users/register/', payload);
  },
  async logout() {
    return api.post('users/logout/');
  },
  async getCurrentShop() {
    const data = await api.get('users/me/');
    return normalizeShop(data);
  },
  async updateShop(payload) {
    const data = await api.post('users/update_shop/', payload);
    return normalizeShop(data);
  },
  async getSummary() {
    const data = await api.get('users/summary/');
    return normalizeSummary(data);
  },
  async getProfile() {
    const data = await api.get('users/profile/');
    return normalizeShop(data);
  },
  async updateProfile(payload) {
    const data = await api.put('users/profile/', payload);
    return normalizeShop(data);
  },
};
