import api from './api';
import { normalizeCustomer, normalizeCustomers } from '../utils/normalizers';

export const customerService = {
    async getAll(page = 1) {
        const data = await api.get(`customers/?page=${page}`);
        if (data.results) {
            return {
                ...data,
                results: normalizeCustomers(data.results)
            };
        }
        return normalizeCustomers(data);
    },
    async getById(id) {
        const data = await api.get(`customers/${id}/`);
        return normalizeCustomer(data);
    },
    async create(data) {
        const respData = await api.post('customers/', data);
        return normalizeCustomer(respData);
    },
    async delete(id) {
        return api.delete(`customers/${id}/`);
    },
    async update(id, data) {
        const respData = await api.patch(`customers/${id}/`, data);
        return normalizeCustomer(respData);
    },
};

export const deleteCustomer = (id) => {
    return api.delete(`customers/${id}/`);
};
