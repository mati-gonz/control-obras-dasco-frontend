import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../services/axiosInstance'; // Usar axiosInstance ya configurada
import { useAuth } from '../../context/useAuth'; // Usar el contexto de autenticación

const CreateWork = () => {
    const [name, setName] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [totalBudget, setTotalBudget] = useState('');
    const [adminId, setAdminId] = useState('');
    const [users, setUsers] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const { user, logout } = useAuth(); // Acceder al usuario y la función de logout desde el contexto
    const navigate = useNavigate();

    useEffect(() => {
        // Si el usuario no está autenticado, redirige al login
        if (!user) {
            navigate('/');
            return;
        }

        // Obtener la lista de usuarios para seleccionar al encargado
        const fetchUsers = async () => {
            try {
                const response = await axiosInstance.get('/users');
                setUsers(response.data.data);
            } catch (error) {
                console.error('Error al obtener los usuarios', error);
                if (error.response && error.response.status === 401) {
                    // Si hay un error de autenticación (401), cerramos la sesión
                    logout();
                }
            }
        };

        fetchUsers();
    }, [user, navigate, logout]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Validación manual de los campos
        if (!name || !startDate || !endDate || !totalBudget || !adminId) {
            setError('Por favor, complete todos los campos.');
            return;
        }

        try {
            await axiosInstance.post('/works', {
                name,
                startDate,
                endDate,
                totalBudget,
                adminId, // ID del usuario encargado seleccionado
            });

            setSuccess('Obra creada con éxito');

            // Redirigir al Dashboard después de la creación exitosa
            setTimeout(() => {
                navigate('/dashboard');
            }, 500); // Espera 1.5 segundos antes de redirigir
        } catch (error) {
            setError('Error al crear la obra. Intente nuevamente.');
            console.error(error);

            if (error.response && error.response.status === 401) {
                // Si hay un error de autenticación (401), cerramos la sesión
                logout();
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
                <h2 className="text-2xl font-bold mb-6 text-center">Crear Nueva Obra</h2>
                {error && <p className="text-red-500 text-center mb-4">{error}</p>}
                {success && <p className="text-green-500 text-center mb-4">{success}</p>}
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700">Nombre de la Obra:</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded mt-1"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700">Fecha de Inicio:</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded mt-1"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700">Fecha de Fin:</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded mt-1"
                            min={startDate} // Establecer el mínimo valor seleccionable
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700">Presupuesto Total:</label>
                        <input
                            type="number"
                            value={totalBudget}
                            onChange={(e) => setTotalBudget(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded mt-1"
                            required
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700">Encargado:</label>
                        <select
                            value={adminId}
                            onChange={(e) => setAdminId(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded mt-1"
                            required
                        >
                            <option value="">Selecciona un encargado</option>
                            {users.map(user => (
                                <option key={user.id} value={user.id}>
                                    {user.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex justify-between">
                        <button 
                            type="button" 
                            onClick={() => navigate('/dashboard')}
                            className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 transition duration-200"
                        >
                            Volver
                        </button>
                        <button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition duration-200">
                            Crear Obra
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateWork;
