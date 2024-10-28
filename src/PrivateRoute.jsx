import { useAuth } from './context/useAuth';
import { Navigate } from 'react-router-dom';
import PropTypes from 'prop-types';

function PrivateRoute({ children }) {
    const { user } = useAuth();

    if (!user) {
        return <Navigate to="/" />;
    }

    return children;
}

PrivateRoute.propTypes = {
    children: PropTypes.node.isRequired,
};

export default PrivateRoute;
