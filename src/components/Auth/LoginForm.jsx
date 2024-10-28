import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEnvelope, FaLock, FaSignInAlt } from 'react-icons/fa';
import { useAuth } from '../../context/useAuth';
import axiosInstance from '../../services/axiosInstance';

const LoginForm = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { user, login } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            navigate('/dashboard');
        }
    }, [user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await axiosInstance.post('/users/login', {
                email,
                password,
            });

            const userData = {
                accessToken: response.data.accessToken,
                refreshToken: response.data.refreshToken,
            };
            login(userData);

            navigate('/dashboard');
        } catch (error) {
            if (error.response) {
                if (error.response.status === 401) {
                    setError('Credenciales incorrectas. Inténtalo de nuevo.');
                } else if (error.response.status === 500) {
                    setError('Error en el servidor. Intenta más tarde.');
                } else {
                    setError('Error desconocido al iniciar sesión.');
                }
            } else {
                setError('No se pudo conectar con el servidor. Intenta más tarde.');
            }
        }
    };

    return (
        <div className="h-screen flex items-center justify-center bg-gray-100 p-4">
            <div className="bg-white p-6 md:p-8 rounded-lg shadow-lg max-w-sm w-full md:max-w-md">
                <h2 className="text-xl md:text-2xl font-bold mb-6 text-center">Gestión de obras DASCO</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="email" className="flex items-center text-gray-700">
                            <FaEnvelope className="mr-2 text-gray-500" />
                            Email:
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded mt-1"
                            required
                        />
                    </div>
                    <div className="mb-6">
                        <label htmlFor="password" className="flex items-center text-gray-700">
                            <FaLock className="mr-2 text-gray-500" />
                            Contraseña:
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded mt-1"
                            required
                        />
                    </div>
                    {error && <p className="text-red-500 text-center mb-4">{error}</p>}
                    <button
                        type="submit"
                        className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition duration-200 flex items-center justify-center"
                    >
                        <FaSignInAlt className="mr-2" />
                        Iniciar Sesión
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginForm;
