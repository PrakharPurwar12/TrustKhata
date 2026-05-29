import api from './api';

export const insightsService = {
  async getInsights(range = 30) {
    const response = await api.get(`/users/insights/?range=${range}`);
    return response.data;
  },
};
