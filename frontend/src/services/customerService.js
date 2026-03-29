import api from './api';

export const customerService = {
    getAll: () => api.get('customers/'),
    getById: (id) => api.get(`customers/${id}/`),
    create: (data) => api.post('customers/', data),
};
