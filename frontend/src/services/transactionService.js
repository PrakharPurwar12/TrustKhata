import api from './api';

export const transactionService = {
    getAll: () => api.get('transactions/'),
    create: (data) => api.post('transactions/', data),
};
