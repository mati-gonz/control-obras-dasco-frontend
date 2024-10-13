// src/components/Dashboard/UserDetails.jsx
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axiosInstance from '../../services/axiosInstance'; // Usar axiosInstance para manejar el token
import ChangePasswordModal from './ChangePasswordModal';

const UserDetails = () => {
    const { id } = useParams();  // Obtener el ID desde la URL
    const navigate = useNavigate();
    const location = useLocation();
    const isProfileView = location.pathname === '/me'; 
    const [user, setUser] = useState(null);
    const [works, setWorks] = useState([]);
    const [error, setError] = useState('');
    const [isPasswordModalOpen, setPasswordModalOpen] = useState(false); 

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                let response;

                // Si es la vista de "Mi Perfil", llama a /me
                if (isProfileView) {
                    response = await axiosInstance.get('/users/me');
                } else {
                    // Si es admin viendo otro perfil, usa el ID de la URL
                    response = await axiosInstance.get(`/users/${id}`);
                }

                setUser(response.data);
                setWorks(response.data.works || []);
            } catch (error) {
                console.error('Error fetching user data:', error);
                setError('Error al obtener los detalles del usuario.');
            }
        };

        fetchUserData();
    }, [id, isProfileView]);

    if (error) {
        return <div>{error}</div>;
    }

    if (!user) {
        return <div>Cargando...</div>;
    }

    const handleEdit = () => {
        if (isProfileView) {
            navigate(`/edit-user/${user.id}`);
        }
    };

    const handleOpenPasswordModal = () => {
        setPasswordModalOpen(true);
    };

    const handleClosePasswordModal = () => {
        setPasswordModalOpen(false);
    };

    return (
        <div className="p-6">
            <div className="bg-white shadow rounded-lg p-6 mb-6">
                <h1 className="text-2xl font-bold mb-4">Detalles del Usuario</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <p><strong>Nombre:</strong> {user.name}</p>
                        <p><strong>Email:</strong> {user.email}</p>
                        <p><strong>Rol:</strong> {user.role}</p>
                    </div>
                    {isProfileView && (
                        <div className="flex flex-col space-y-4">
                            <button
                                onClick={handleEdit}
                                className="bg-yellow-500 text-white py-2 px-4 rounded text-sm hover:bg-yellow-600 transition duration-200"
                                style={{ width: 'fit-content', alignSelf: 'flex-start' }}
                            >
                                Editar
                            </button>
                            <button
                                onClick={handleOpenPasswordModal}
                                className="bg-blue-500 text-white py-2 px-4 rounded text-sm hover:bg-blue-600 transition duration-200"
                                style={{ width: 'fit-content', alignSelf: 'flex-start' }}
                            >
                                Cambiar Contraseña
                            </button>
                        </div>
                    )}

                    <ChangePasswordModal
                        open={isPasswordModalOpen}
                        handleClose={handleClosePasswordModal}
                        userId={user.id}
                    />
                </div>
            </div>

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
        </div>
    );
};

export default UserDetails;
