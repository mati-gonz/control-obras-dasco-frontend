import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../../services/axiosInstance';  // Usar axiosInstance en vez de axios
import { useAuth } from '../../context/useAuth';  // Importar el contexto de autenticación

const EditUser = () => {
    const { id } = useParams();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('user');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();
    const { user } = useAuth();  // Obtener la información de autenticación desde el contexto

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await axiosInstance.get(`/users/${id}`);
                const { name, email, role } = response.data.data;
                setName(name);
                setEmail(email);
                setRole(role);
    
                // Si el usuario no es administrador y no es el propietario del perfil, redirigir
                if (user.role !== 'admin' && user.id !== parseInt(id)) {
                    navigate('/'); // Redirigir a la página principal si no tiene permiso
                }
            } catch (error) {
                console.error('Error fetching user data', error);
                setError('Error al obtener los datos del usuario.');
            }
        };
    
        fetchUserData();
    }, [id, navigate, user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Preparamos los datos del formulario
        const userData = { name, email };

        // Solo los administradores pueden cambiar el rol
        if (user.role === 'admin') {
            userData.role = role;
        }

        try {
            await axiosInstance.put(`/users/${id}`, userData);
            setSuccess('Usuario actualizado con éxito');

            // Redirigir al User Management después de actualizar el usuario
            setTimeout(() => {
                navigate('/user-management');  // Redirige a la lista de usuarios
            }, 1000); // Espera 2 segundos antes de redirigir

        } catch (error) {
            setError('Error al actualizar el usuario. Intente nuevamente.');
            console.error(error);
        }
    };

    // Manejar el botón "Volver" que redirige al User Management sin actualizar
    const handleBack = () => {
        navigate(`/users/${id}/details`);
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
                <h2 className="text-2xl font-bold mb-6 text-center">Editar Usuario</h2>
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
                    
                    {/* Solo mostrar el campo de rol si el usuario es administrador */}
                    {user.role === 'admin' && (
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

                    <div className="flex justify-between">
                        <button 
                            type="button" 
                            onClick={handleBack}  // Botón para volver
                            className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 transition duration-200"
                        >
                            Volver
                        </button>
                        <button 
                            type="submit" 
                            className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition duration-200"
                        >
                            Actualizar Usuario
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditUser;
