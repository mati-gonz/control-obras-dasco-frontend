// src/components/Dashboard/UserDetails.jsx
import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axiosInstance from '../../services/axiosInstance'; // Usar axiosInstance para manejar el token automáticamente
import { useAuth } from '../../context/useAuth';  // Usar contexto de autenticación

const UserDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user: loggedInUser } = useAuth();  // Obtener el usuario autenticado desde el contexto
    const [user, setUser] = useState(null);
    const [works, setWorks] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                // Obtener detalles del usuario
                const userResponse = await axiosInstance.get(`/users/${id}`);
                setUser(userResponse.data.data);
                setWorks(userResponse.data.data.works || []);
            } catch (error) {
                console.error('Error fetching user data:', error);
                setError('Error al obtener los detalles del usuario.');
            }
        };

        fetchUserData();
    }, [id]);

    if (error) {
        return <div>{error}</div>;
    }

    if (!user) {
        return <div>Cargando...</div>;
    }

    const handleEdit = () => {
        navigate(`/edit-user/${user.id}`);
    };

    const handleDelete = async () => {
        try {
            await axiosInstance.delete(`/users/${user.id}`);
            navigate('/user-management');
        } catch (error) {
            console.error('Error deleting user:', error);
            setError('Error al eliminar el usuario.');
        }
    };

    return (
        <div className="p-6">
            {/* Detalles del usuario */}
            <div className="bg-white shadow rounded-lg p-6 mb-6">
                <h1 className="text-2xl font-bold mb-4">Detalles del Usuario</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <p><strong>Nombre:</strong> {user.name}</p>
                        <p><strong>Email:</strong> {user.email}</p>
                        <p><strong>Rol:</strong> {user.role}</p>
                    </div>
                    {loggedInUser?.role === 'admin' && (
                        <div className="flex flex-col space-y-4">
                            <button
                                onClick={handleEdit}
                                className="bg-yellow-500 text-white py-2 px-4 rounded text-sm hover:bg-yellow-600 transition duration-200"
                                style={{ width: 'fit-content', alignSelf: 'flex-start' }}
                            >
                                Editar
                            </button>
                            <button
                                onClick={handleDelete}
                                className="bg-red-500 text-white py-2 px-4 rounded text-sm hover:bg-red-600 transition duration-200"
                                style={{ width: 'fit-content', alignSelf: 'flex-start' }}
                            >
                                Eliminar
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Lista de obras a cargo */}
            <div className="bg-white shadow rounded-lg p-6 mb-6">
                <h2 className="text-xl font-bold mb-4">Obras a Cargo</h2>
                <ul className="list-disc pl-5">
                    {works.length > 0 ? (
                        works.map(work => (
                            <li key={work.id} className="mb-2">
                                {work.name}
                            </li>
                        ))
                    ) : (
                        <li>No hay obras a cargo.</li>
                    )}
                </ul>
            </div>

            {/* Botón de volver */}
            <button
                onClick={() => navigate('/user-management')}
                className="bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400 transition duration-200"
                style={{ width: 'fit-content', alignSelf: 'flex-start' }}
            >
                Volver
            </button>
        </div>
    );
};

export default UserDetails;