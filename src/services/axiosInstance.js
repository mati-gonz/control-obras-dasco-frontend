import axios from 'axios';

const apiUrl = import.meta.env.VITE_ENVIRONMENT === 'development'
    ? import.meta.env.VITE_API_URL_DEV
    : import.meta.env.VITE_API_URL;

const axiosInstance = axios.create({
    baseURL: apiUrl,
});

// Interceptor para agregar el token de acceso en cada solicitud
axiosInstance.interceptors.request.use((config) => {
    const accessToken = localStorage.getItem('accessToken'); // Extraer el token del localStorage
    if (accessToken) {
        config.headers['Authorization'] = `Bearer ${accessToken}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Interceptor para manejar errores 401 y renovar el token
axiosInstance.interceptors.response.use((response) => {
    return response;
}, async (error) => {
    const originalRequest = error.config;

    // Si el error es 401 (Acceso denegado) y no hemos intentado renovar el token aún
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        // Obtenemos el RefreshToken del localStorage
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
            // Si no hay RefreshToken, cerramos la sesión
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            window.location.href = '/';  // Redirigir al login
            return Promise.reject(error);
        }

        try {
            // Intentamos renovar el token de acceso con el RefreshToken
            const response = await axios.post(`${apiUrl}/users/refresh-token`, { refreshToken });

            if (response.status === 200) {
                const newAccessToken = response.data.accessToken;

                // Guardamos el nuevo token de acceso en el localStorage
                localStorage.setItem('accessToken', newAccessToken);

                // Actualizamos la solicitud original con el nuevo token y la reintentamos
                originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

                return axiosInstance(originalRequest);  // Reintentar la solicitud original
            }
        } catch (err) {
            console.error("Error renovando el token:", err);
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            window.location.href = '/';  // Redirigir al login
        }
    }

    return Promise.reject(error);  // Si no es 401 o falla la renovación, rechazamos el error
});

export default axiosInstance;
