import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../../services/axiosInstance'; // Usar axiosInstance configurada
import { useAuth } from '../../context/useAuth'; // Usar el contexto de autenticación

const EditWork = () => {
    const { id } = useParams(); // Obtener el ID de la obra de la URL
    const [name, setName] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [totalBudget, setTotalBudget] = useState('');
    const [formattedBudget, setFormattedBudget] = useState('');  // Mantén el valor formateado
    const [adminId, setAdminId] = useState('');
    const [users, setUsers] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const { user, logout } = useAuth(); // Acceder al usuario y la función de logout desde el contexto
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) {
            navigate('/');
            return;
        }

        const fetchData = async () => {
            try {
                const workResponse = await axiosInstance.get(`/works/${id}`);
                const { name, startDate, endDate, totalBudget, adminId } = workResponse.data;
                setName(name);
                setStartDate(startDate ? new Date(startDate).toISOString().split('T')[0] : '');
                setEndDate(endDate ? new Date(endDate).toISOString().split('T')[0] : '');
                setTotalBudget(totalBudget);
                setFormattedBudget(formatNumberWithDots(totalBudget.toString())); // Formatea el presupuesto inicial
                setAdminId(adminId);

                const usersResponse = await axiosInstance.get('/users');
                setUsers(usersResponse.data.data);
            } catch (error) {
                console.error('Error al obtener los datos', error);
                setError('Error al obtener los datos de la obra o los usuarios.');
                if (error.response && error.response.status === 401) {
                    logout(); // Si hay un error de autenticación (401), cerrar sesión
                }
            }
        };

        fetchData();
    }, [id, user, navigate, logout]);

    // Función para formatear el número con puntos
    const formatNumberWithDots = (number) => {
        return number.replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    };

    // Función para manejar cambios en el campo de presupuesto
    const handleBudgetChange = (e) => {
        const value = e.target.value;
        setFormattedBudget(formatNumberWithDots(value)); // Actualiza el valor formateado
        setTotalBudget(value.replace(/\./g, ''));  // Elimina los puntos para mantener el número "limpio"
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            await axiosInstance.put(`/works/${id}`, {
                name,
                startDate,
                endDate,
                totalBudget,
                adminId, // ID del usuario encargado seleccionado
            });
            setSuccess('Obra actualizada con éxito');
            setTimeout(() => {
                navigate('/dashboard');
            }, 500); 
        } catch (error) {
            setError('Error al actualizar la obra. Intente nuevamente.');
            console.error(error);
            if (error.response && error.response.status === 401) {
                logout(); 
            }
        }
    };

    const handleBack = () => {
        navigate('/dashboard');
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
                <h2 className="text-2xl font-bold mb-6 text-center">Editar Obra</h2>
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
                            value={startDate || ''}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded mt-1"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700">Fecha de Fin:</label>
                        <input
                            type="date"
                            value={endDate || ''}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded mt-1"
                            min={startDate}
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700">Presupuesto Total:</label>
                        <input
                            type="text"  // Cambiamos a texto para permitir la inserción de puntos
                            value={formattedBudget}
                            onChange={handleBudgetChange}
                            className="w-full p-2 border border-gray-300 rounded mt-1"
                            required
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700">Responsable de la Obra:</label>
                        <select
                            value={adminId}
                            onChange={(e) => setAdminId(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded mt-1"
                            required
                        >
                            <option value="">Selecciona un responsable</option>
                            {users.map(user => (
                                <option key={user.id} value={user.id}>
                                    {user.name} ({user.email})
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex justify-between">
                        <button 
                            type="button" 
                            onClick={handleBack} 
                            className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 transition duration-200"
                        >
                            Volver
                        </button>
                        <button 
                            type="submit" 
                            className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition duration-200"
                        >
                            Actualizar Obra
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditWork;
