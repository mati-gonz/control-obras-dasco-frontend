import { useEffect, useState } from 'react';
import axiosInstance from '../../services/axiosInstance';  // Usar axiosInstance en vez de axios
import { useNavigate } from 'react-router-dom';
import ConfirmationModal from '../Common/ConfirmationModal';  // Importa el modal de confirmación
import { FaEye, FaEdit, FaTrashAlt } from 'react-icons/fa';  // Importa los iconos de FontAwesome
import { useAuth } from '../../context/useAuth';  // Importar el contexto de autenticación

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const navigate = useNavigate();

    // Obtener `user` desde `useAuth` en el cuerpo del componente, solo una vez
    const { user } = useAuth();  // Obtener el usuario autenticado desde el contexto

    useEffect(() => {
        const fetchUsers = async () => {
            if (!user || user.role !== 'admin') {
                navigate('/');  // Redirigir si no es admin
                return;
            }

            try {
                // Obtener lista de usuarios desde la API
                const usersResponse = await axiosInstance.get('/users');
                setUsers(usersResponse.data.data);
            } catch (error) {
                console.error('Error fetching users', error);
                setError('Error al obtener los usuarios.');
            }
        };

        fetchUsers();
    }, [user, navigate]);

    // Manejar la solicitud de eliminar usuario
    const handleDeleteUser = (user) => {
        if (user.role === 'admin') {
            setError('No puedes eliminar a un administrador.');
        } else {
            setSelectedUser(user);
            setShowModal(true);  // Abrir modal de confirmación
        }
    };

    // Confirmar la eliminación del usuario
    const confirmDeleteUser = async () => {
        if (selectedUser) {
            try {
                const response = await axiosInstance.delete(`/users/${selectedUser.id}`);

                // Verificar si la respuesta es correcta
                if (response.status === 200) {
                    setUsers(users.filter(u => u.id !== selectedUser.id));  // Eliminar del estado local
                    setShowModal(false);  // Cerrar el modal tras eliminar
                    setError('');  // Limpiar cualquier error existente
                } else {
                    setError(response.data.message || 'No se puede eliminar el usuario.');
                }
            } catch (error) {
                // Manejar errores específicos del backend y mostrar el mensaje correcto
                if (error.response && error.response.status === 400) {
                    setError('No se puede eliminar el usuario porque tiene obras a cargo.');
                } else if (error.response && error.response.status === 403) {
                    setError('No tienes permiso para eliminar este usuario.');
                } else {
                    setError('Ocurrió un error inesperado al eliminar el usuario.');
                }
                setShowModal(false);  // Cerrar el modal aunque ocurra un error
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="p-6">
                <div className="container mx-auto">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold">Gestión de Usuarios</h1>
                        <button
                            onClick={() => navigate('/register-user')}
                            className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition duration-200"
                        >
                            + Registrar Usuario
                        </button>
                    </div>

                    {/* Mostrar mensaje de error */}
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

                    <table className="min-w-full bg-white border-collapse">
                        <thead>
                            <tr>
                                <th className="py-2 px-4 bg-gray-200 text-left">Nombre</th>
                                <th className="py-2 px-4 bg-gray-200 text-left">Email</th>
                                <th className="py-2 px-4 bg-gray-200 text-left">Rol</th>
                                <th className="py-2 px-4 bg-gray-200 text-left">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.id} className="hover:bg-gray-100">
                                    <td className="py-2 px-4 border-b">{user.name}</td>
                                    <td className="py-2 px-4 border-b">{user.email}</td>
                                    <td className="py-2 px-4 border-b">{user.role}</td>
                                    <td className="py-2 px-4 border-b flex">
                                        <button
                                            onClick={() => navigate(`/users/${user.id}/details`)}
                                            className="bg-blue-500 text-white py-1 px-2 rounded hover:bg-blue-600 transition duration-200 mr-2 flex items-center"
                                        >
                                            <FaEye className="mr-1" /> Ver Detalle
                                        </button>
                                        <button
                                            onClick={() => navigate(`/edit-user/${user.id}`)}
                                            className="bg-yellow-500 text-white py-1 px-2 rounded hover:bg-yellow-600 transition duration-200 mr-2 flex items-center"
                                        >
                                            <FaEdit className="mr-1" /> Editar
                                        </button>
                                        <button
                                            onClick={() => handleDeleteUser(user)}
                                            className="bg-red-500 text-white py-1 px-2 rounded hover:bg-red-600 transition duration-200 flex items-center"
                                        >
                                            <FaTrashAlt className="mr-1" /> Eliminar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                </div>
            </div>

            {/* Modal de Confirmación */}
            <ConfirmationModal
                show={showModal}
                onClose={() => setShowModal(false)}
                onConfirm={confirmDeleteUser}
                message={`¿Estás seguro de que deseas eliminar al usuario ${selectedUser?.name}?`}
            />
        </div>
    );
};

export default UserManagement;
