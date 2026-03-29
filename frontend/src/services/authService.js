import api from './api';

export const authService = {
    login: async (credentials) => {
        // Dummy implementation
        return { data: { token: 'dummy_token', user: 'Admin' } };
    },
    logout: () => {
        // Dummy implementation
    }
};
