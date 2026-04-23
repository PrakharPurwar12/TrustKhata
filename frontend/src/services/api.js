import axios from 'axios';

const SAFE_METHODS = new Set(['get', 'head', 'options', 'trace']);

function ensureTrailingSlash(value) {
    return value.endsWith('/') ? value : `${value}/`;
}

function resolveApiBaseUrl() {
    const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();

    if (configuredBaseUrl) {
        return ensureTrailingSlash(configuredBaseUrl);
    }

    return '/api/';
}

const apiBaseUrl = resolveApiBaseUrl();

const api = axios.create({
    baseURL: apiBaseUrl,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true
});

let csrfToken = null;
let csrfRequest = null;

export async function ensureCsrfToken() {
    if (csrfToken) {
        return csrfToken;
    }

    if (!csrfRequest) {
        csrfRequest = api.get('users/csrf/').then((data) => {
            csrfToken = data?.csrfToken || null;
            return csrfToken;
        }).finally(() => {
            csrfRequest = null;
        });
    }

    return csrfRequest;
}

api.interceptors.request.use(async (config) => {
    const method = (config.method || 'get').toLowerCase();
    const requestUrl = config.url || '';

    if (SAFE_METHODS.has(method) || requestUrl === 'users/csrf/') {
        return config;
    }

    const token = await ensureCsrfToken();

    if (token) {
        config.headers = {
            ...config.headers,
            'X-CSRFToken': token,
        };
    }

    return config;
});

api.interceptors.response.use(
    (response) => {
        if (response.data && response.data.success === true) {
            return response.data.data;
        }
        return response;
    },
    async (error) => {
        const originalRequest = error.config;
        const method = (originalRequest?.method || 'get').toLowerCase();
        const status = error.response?.status;
        const message = error.response?.data?.error?.message || error.response?.data?.detail || '';

        if (
            originalRequest &&
            !SAFE_METHODS.has(method) &&
            !originalRequest._csrfRetried &&
            status === 403 &&
            /csrf/i.test(String(message))
        ) {
            originalRequest._csrfRetried = true;
            csrfToken = null;
            const token = await ensureCsrfToken();

            if (token) {
                originalRequest.headers = {
                    ...originalRequest.headers,
                    'X-CSRFToken': token,
                };
            }

            return api(originalRequest);
        }

        if (error.response?.data?.success === false) {
            return Promise.reject(error.response.data.error);
        }

        return Promise.reject(error);
    }
);

export default api;
