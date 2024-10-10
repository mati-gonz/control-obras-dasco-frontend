// src/components/Layout/Layout.jsx
import { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import { useAuth } from '../../context/useAuth';  // Usar el contexto de autenticación

const Layout = () => {
    const [error, setError] = useState('');
    const { user, logout } = useAuth();  // Obtener user y logout desde el contexto
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) {
            navigate('/'); // Redirige al login si no hay usuario
        }
    }, [user, navigate]);  // Solo se ejecuta si cambia el usuario

    return (
        <div>
            <Navbar userRole={user?.role} onLogout={logout} />  {/* Usar el rol del contexto */}
            <div className="content">
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
                        <strong className="font-bold">Error:</strong>
                        <span className="block sm:inline"> {error}</span>
                        <button onClick={() => setError('')} className="absolute top-0 bottom-0 right-0 px-4 py-3">
                            <svg className="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                <title>Cerrar</title>
                                <path d="M14.348 5.652a.5.5 0 0 0-.707 0L10 9.293 6.354 5.652a.5.5 0 1 0-.707.707l3.647 3.646-3.646 3.646a.5.5 0 1 0 .707.707L10 10.707l3.646-3.646a.5.5 0 0 0 0-.707z"/>
                            </svg>
                        </button>
                    </div>
                )}
                <Outlet />  {/* Aquí se renderizan las rutas hijas */}
            </div>
        </div>
    );
};

export default Layout;
