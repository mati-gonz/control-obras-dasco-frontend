// src/components/Auth/RegisterForm.jsx
import { useState } from 'react';
import axiosInstance from '../../services/axiosInstance';  // Usar axiosInstance configurado
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types'; 

const RegisterForm = ({ isAdmin }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState(isAdmin ? 'user' : 'admin');  // Definir el rol según el contexto
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Validar campos obligatorios
        if (!name || !email || !password) {
            setError('Por favor, complete todos los campos.');
            return;
        }

        try {
            const newUser = { name, email, password, role };

            // Hacer una solicitud a la API usando axiosInstance
            await axiosInstance.post('/users/register', newUser);

            setSuccess('Usuario registrado con éxito.');
            setName('');
            setEmail('');
            setPassword('');
            if (!isAdmin) {
                setRole('user');
            }

            // Redirigir según el contexto
            if (isAdmin) {
                setTimeout(() => {
                    navigate('/user-management');  // Redirigir a la gestión de usuarios si es admin
                }, 500);
            } else {
                setTimeout(() => {
                    navigate('/');  // Redirigir al login para usuarios normales
                }, 500);
            }
        } catch (error) {
            setError('Error al registrar el usuario. Intente nuevamente.');
            console.error('Error al registrar usuario:', error);
        }
    };

    const handleBack = () => {
        navigate('/user-management');  // Redirigir a la gestión de usuarios
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
                <h2 className="text-2xl font-bold mb-6 text-center">{isAdmin ? 'Registrar Nuevo Usuario' : 'Registrarse'}</h2>
                {error && <p className="text-red-500 text-center mb-4">{error}</p>}
                {success && <p className="text-green-500 text-center mb-4">{success}</p>}
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700">Nombre:</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded mt-1"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700">Email:</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded mt-1"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700">Contraseña:</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded mt-1"
                            required
                        />
                    </div>
                    {isAdmin && (
                        <div className="mb-6">
                            <label className="block text-gray-700">Rol:</label>
                            <select
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded mt-1"
                                required
                            >
                                <option value="user">Usuario Regular</option>
                                <option value="admin">Administrador</option>
                            </select>
                        </div>
                    )}
                    <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition duration-200">
                        {isAdmin ? 'Registrar Usuario' : 'Registrarse'}
                    </button>
                    {isAdmin && (
                        <button
                            type="button"
                            onClick={handleBack}
                            className="w-full mt-4 bg-gray-500 text-white py-2 rounded hover:bg-gray-600 transition duration-200"
                        >
                            Volver
                        </button>
                    )}
                </form>
            </div>
        </div>
    );
};

// Definir propTypes para validar las propiedades
RegisterForm.propTypes = {
    isAdmin: PropTypes.bool.isRequired,  // isAdmin debe ser un booleano y es requerido
};

export default RegisterForm;
