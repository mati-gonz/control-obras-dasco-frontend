import PropTypes from 'prop-types';  // Importa PropTypes para la validación de props
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEdit } from 'react-icons/fa';  // Importa los iconos de FontAwesome

const WorkCard = ({ work, userRole, onEdit }) => {
    const navigate = useNavigate();

    // Formatear fecha en formato dd/mm/yyyy
    const formatDate = (dateString) => {
        if (!dateString) return 'Sin fecha'; // Validar que dateString exista
        const date = new Date(dateString);
        const day = String(date.getUTCDate()).padStart(2, '0');
        const month = String(date.getUTCMonth() + 1).padStart(2, '0');
        const year = date.getUTCFullYear();
        return `${day}/${month}/${year}`;
    };

    // Formatear presupuesto en formato de moneda CLP
    const formatCurrency = (amount) => {
        if (!amount) return 'Sin presupuesto'; // Validar que amount exista
        return Number(amount).toLocaleString('es-CL', { style: 'currency', currency: 'CLP', minimumFractionDigits: 0 });
    };

    // Navegar a los detalles de la obra
    const handleViewDetail = () => {
        navigate(`/work/${work.id}/details`);
    };

    return (
        <div className="bg-white p-4 rounded-lg shadow-lg">
            <h3 className="text-xl font-bold mb-2">{work.name || 'Sin nombre'}</h3> {/* Validar el nombre */}
            <p className="mb-1">Fecha de Inicio: {formatDate(work.startDate)}</p>
            <p className="mb-1">Fecha de Fin: {formatDate(work.endDate)}</p>
            <p className="mb-1">Presupuesto Total: {formatCurrency(work.totalBudget)}</p>
            <div className="flex justify-between mt-4">
                <button 
                    onClick={handleViewDetail} 
                    className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition duration-200 mr-2 flex items-center"
                >
                    <FaEye className="mr-1" /> Ver Detalle
                </button>
                {/* Mostrar el botón de Editar solo si el usuario es admin */}
                {userRole === 'admin' && (
                    <button 
                        onClick={onEdit} 
                        className="bg-yellow-500 text-white py-2 px-4 rounded hover:bg-yellow-600 transition duration-200 mr-2 flex items-center"
                    >
                        <FaEdit className="mr-1" /> Editar
                    </button>
                )}
            </div>
        </div>
    );
};

// Validar las props que recibe el componente
WorkCard.propTypes = {
    work: PropTypes.shape({
        id: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
        startDate: PropTypes.string,
        endDate: PropTypes.string,
        totalBudget: PropTypes.number,
    }).isRequired,
    userRole: PropTypes.string.isRequired,
    onEdit: PropTypes.func.isRequired,
};

export default WorkCard;
