// src/components/Dashboard/UserDetails.jsx
import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import axiosInstance from '../../services/axiosInstance'; // Usar axiosInstance para manejar el token automáticamente
import { useAuth } from '../../context/useAuth';  // Usar contexto de autenticación
import ChangePasswordModal from './ChangePasswordModal';  // Importar el componente del modal de cambio de contraseña

const UserDetail = ({ isMe }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user: loggedInUser, loading } = useAuth();  // Obtener el usuario autenticado y el estado de carga desde el contexto
    const [user, setUser] = useState(null);
    const [works, setWorks] = useState([]);
    const [error, setError] = useState('');
    const [isPasswordModalOpen, setPasswordModalOpen] = useState(false);  // Estado para el modal de cambiar contraseña

    useEffect(() => {
        // No hacer la llamada a la API si el usuario está cargando
        if (loading || !loggedInUser) {
            return;
        }

        const fetchUserData = async () => {
            try {
                const userResponse = isMe 
                    ? await axiosInstance.get(`/users/${loggedInUser.id}`) 
                    : await axiosInstance.get(`/users/${id}`);
                setUser(userResponse.data.data);
                setWorks(userResponse.data.data.works || []);
            } catch (error) {
                console.error('Error fetching user data:', error);
                setError('Error al obtener los detalles del usuario.');
            }
        };

        fetchUserData();
    }, [id, isMe, loggedInUser, loading]);
    
    // Mostrar mensaje de error si ocurre
    if (error) {
        return <div>{error}</div>;
    }

    // Mostrar un indicador de carga si el usuario aún está cargando o si no hay datos de usuario
    if (loading || !user) {
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

    const handleReturn = () => {
        isMe ? navigate('/dashboard') : navigate('/user-management');
    };

    const handleOpenPasswordModal = () => {
        setPasswordModalOpen(true);
    };

    const handleClosePasswordModal = () => {
        setPasswordModalOpen(false);
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
                    {isMe && (
                        <button
                            onClick={handleOpenPasswordModal}
                            className="bg-blue-500 text-white py-2 px-4 rounded text-sm hover:bg-blue-600 transition duration-200"
                            style={{ width: 'fit-content', alignSelf: 'flex-start' }}
                        >
                            Cambiar Contraseña
                        </button>
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
                onClick={handleReturn}
                className="bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400 transition duration-200"
                style={{ width: 'fit-content', alignSelf: 'flex-start' }}
            >
                Volver
            </button>

            {/* Modal para cambiar contraseña */}
            <ChangePasswordModal
                open={isPasswordModalOpen}
                handleClose={handleClosePasswordModal}
                userId={loggedInUser.id}  // Pasar el ID del usuario autenticado
            />
        </div>
    );
};

UserDetail.propTypes = {
    isMe: PropTypes.bool,  // Definir el tipo de isMe como boolean
};

export default UserDetail;
