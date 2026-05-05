import api from './api';
import { normalizeTransaction, normalizeTransactions } from '../utils/normalizers';

export const transactionService = {
    async getAll(params = {}) {
        const data = await api.get('transactions/', { params });
        if (data.results) {
            return {
                ...data,
                results: normalizeTransactions(data.results)
            };
        }
        return normalizeTransactions(data);
    },
    async getByCustomer(customerId, page = 1, sort = '', type = '') {
        const params = { customer: customerId, page };
        if (sort) params.sort = sort;
        if (type && type !== 'ALL') params.type = type;
        const data = await api.get('transactions/', { params });
        if (data.results) {
            return {
                ...data,
                results: normalizeTransactions(data.results)
            };
        }
        return normalizeTransactions(data);
    },
    async create(data) {
        const respData = await api.post('transactions/', data);
        return normalizeTransaction(respData);
    },
};
