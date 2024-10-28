import axios from 'axios';

const apiUrl = import.meta.env.VITE_ENVIRONMENT === 'development'
    ? import.meta.env.VITE_API_URL_DEV
    : import.meta.env.VITE_API_URL;

const axiosInstance = axios.create({
    baseURL: apiUrl,
});

axiosInstance.interceptors.request.use((config) => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
        config.headers['Authorization'] = `Bearer ${accessToken}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

axiosInstance.interceptors.response.use((response) => {
    return response;
}, async (error) => {
    const originalRequest = error.config;

    if (error.response && error.response.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            window.location.href = '/';
            return Promise.reject(error);
        }

        try {
            const response = await axios.post(`${apiUrl}/users/refresh-token`, { refreshToken });

            if (response.status === 200) {
                const newAccessToken = response.data.accessToken;

                localStorage.setItem('accessToken', newAccessToken);

                originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

                return axiosInstance(originalRequest);
            }
        } catch (err) {
            console.error("Error renovando el token:", err);
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            window.location.href = '/';
        }
    }

    return Promise.reject(error);
});

export default axiosInstance;
