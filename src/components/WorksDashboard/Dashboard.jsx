import { useEffect, useState } from 'react';
import axiosInstance from '../../services/axiosInstance'; // Usar axiosInstance desde el servicio
import { useNavigate } from 'react-router-dom';
import WorkCard from './WorkCard'; // El componente que renderiza las obras
import { useAuth } from '../../context/useAuth'; // Importar contexto de autenticación

const Dashboard = () => {
    const [works, setWorks] = useState([]);
    const [error, setError] = useState('');
    const { user } = useAuth(); // Obtener usuario desde el contexto
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserData = async () => {
            if (!user) {
                navigate('/'); // Redirigir si no hay usuario autenticado
                return;
            }

            try {
                const worksResponse = await axiosInstance.get('/works');

                if (Array.isArray(worksResponse.data.data)) {
                    const formattedWorks = worksResponse.data.data.map(work => ({
                        ...work,
                        totalBudget: Number(work.totalBudget), // Asegurarse de que `totalBudget` sea un número
                    }));

                    setWorks(formattedWorks); // Guardar las obras en el estado
                } else {
                    console.error('La respuesta de la API no es un array', worksResponse.data.data);
                    setError('Error al obtener las obras.');
                }
            } catch (error) {
                console.error('Error fetching data', error);
                setError('Error al obtener las obras.');
            }
        };

        fetchUserData();
    }, [user, navigate]); // Se asegura de que solo se ejecute cuando el usuario cambie

    const handleCreateWork = () => {
        navigate('/create-work'); // Redirige a la página de crear obra
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="p-6">
                <div className="container mx-auto">
                    {/* Mostrar error si existe */}
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

                    {/* Botón de Crear Obra visible solo para ciertos roles, como admin */}
                    {user?.role === 'admin' && (
                        <div className="mb-6 text-right">
                            <button
                                className="bg-green-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
                                onClick={handleCreateWork}
                            >
                                + Crear Obra
                            </button>
                        </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-6">
                        {/* Asegúrate de que works es un array antes de mapear */}
                        {Array.isArray(works) && works.map(work => (
                            <WorkCard
                                key={work.id}
                                work={work}
                                userRole={user?.role}
                                onEdit={() => navigate(`/edit-work/${work.id}`)}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
