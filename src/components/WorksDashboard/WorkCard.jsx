import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEdit, FaTrash } from 'react-icons/fa';

const WorkCard = ({ work, userRole, onEdit, onDelete }) => {
    const navigate = useNavigate();

    const formatDate = (dateString) => {
        if (!dateString) return 'Sin fecha';
        const date = new Date(dateString);
        const day = String(date.getUTCDate()).padStart(2, '0');
        const month = String(date.getUTCMonth() + 1).padStart(2, '0');
        const year = date.getUTCFullYear();
        return `${day}/${month}/${year}`;
    };

    const formatCurrency = (amount) => {
        if (!amount) return 'Sin presupuesto';
        return Number(amount).toLocaleString('es-CL', { style: 'currency', currency: 'CLP', minimumFractionDigits: 0 });
    };

    const handleViewDetail = () => {
        navigate(`/work/${work.id}/details`);
    };

    return (
        <div className="bg-white p-4 rounded-lg shadow-lg">
            <h3 className="text-xl font-bold mb-2">{work.name || 'Sin nombre'}</h3>
            <p className="mb-1">Fecha de Inicio: {formatDate(work.startDate)}</p>
            <p className="mb-1">Fecha de Fin: {formatDate(work.endDate)}</p>
            <p className="mb-1">Presupuesto Total: {formatCurrency(work.totalBudget)}</p>
            <div className="flex flex-wrap justify-between mt-4">
                <button 
                    onClick={handleViewDetail} 
                    className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition duration-200 mr-2 mb-2 flex items-center"
                >
                    <FaEye className="mr-1" /> Ver Detalle
                </button>
                {userRole === 'admin' && (
                    <div className="flex flex-wrap">
                        <button 
                            onClick={onEdit} 
                            className="bg-yellow-500 text-white py-2 px-4 rounded hover:bg-yellow-600 transition duration-200 mr-2 mb-2 flex items-center"
                        >
                            <FaEdit className="mr-1" /> Editar
                        </button>
                        <button 
                            onClick={onDelete} 
                            className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition duration-200 mb-2 flex items-center"
                        >
                            <FaTrash className="mr-1" /> Eliminar
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

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
    onDelete: PropTypes.func.isRequired,
};

export default WorkCard;
