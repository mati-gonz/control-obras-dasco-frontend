// src/context/AuthContext.js
import { createContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';  // Importa PropTypes
import { jwtDecode } from 'jwt-decode';  // Importación por defecto

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true); // Agregar estado de carga

    useEffect(() => {
        const accessToken = localStorage.getItem('accessToken');
        const refreshToken = localStorage.getItem('refreshToken');

        if (accessToken && refreshToken) {
            // Decodifica el token para obtener los datos, incluyendo el rol
            const decoded = jwtDecode(accessToken);
            setUser({
                accessToken,
                refreshToken,
                role: decoded.role,  // Agrega el rol extraído del token
                id: decoded.userId,
            });
        }

        // Después de verificar las credenciales, marcamos la carga como finalizada
        setLoading(false); // Cargar finalizada
    }, []);

    const login = (userData) => {
        // Decodifica el token para obtener el rol
        const decoded = jwtDecode(userData.accessToken);
        setUser({
            accessToken: userData.accessToken,
            refreshToken: userData.refreshToken,
            role: decoded.role,  // Almacena el rol del usuario
            id: decoded.userId,
        });
        localStorage.setItem('accessToken', userData.accessToken);
        localStorage.setItem('refreshToken', userData.refreshToken);
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

// Aquí defines las PropTypes para `children`
AuthProvider.propTypes = {
    children: PropTypes.node.isRequired,  // Valida que `children` sea un nodo de React
};

export default AuthContext;
