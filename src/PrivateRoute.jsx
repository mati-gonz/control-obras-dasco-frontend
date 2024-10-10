import { useAuth } from './context/useAuth';
import { Navigate } from 'react-router-dom';
import PropTypes from 'prop-types';

function PrivateRoute({ children }) {
    const { user } = useAuth();  // Verificar si el usuario está autenticado

    if (!user) {
        // Si el usuario no está autenticado, redirigir al login
        return <Navigate to="/" />;
    }

    return children; // Si está autenticado, mostrar el contenido protegido
}

// Define las PropTypes para `children`
PrivateRoute.propTypes = {
    children: PropTypes.node.isRequired,
};

export default PrivateRoute;
