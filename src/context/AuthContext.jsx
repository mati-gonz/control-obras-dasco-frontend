import { createContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const accessToken = localStorage.getItem('accessToken');
        const refreshToken = localStorage.getItem('refreshToken');

        if (accessToken && refreshToken) {
            const decoded = jwtDecode(accessToken);
            setUser({
                accessToken,
                refreshToken,
                role: decoded.role,
                id: decoded.userId,
            });
        }

        setLoading(false);
    }, []);

    const login = (userData) => {
        const decoded = jwtDecode(userData.accessToken);
        setUser({
            accessToken: userData.accessToken,
            refreshToken: userData.refreshToken,
            role: decoded.role,
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

AuthProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

export default AuthContext;
