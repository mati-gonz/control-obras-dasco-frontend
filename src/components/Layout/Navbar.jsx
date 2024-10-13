import { Link } from 'react-router-dom';
import { FaHardHat, FaUser, FaSignOutAlt } from 'react-icons/fa';
import { useAuth } from '../../context/useAuth';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
    const { user, logout } = useAuth();  // Obtener el usuario autenticado
    const navigate = useNavigate();  // Para navegar a diferentes rutas

    const handleLogout = () => {
        logout();
        navigate('/', { replace: true });
    };

    return (
        <nav className="bg-blue-500 p-4 flex justify-between items-center">
            <div className="flex items-center">
                <Link 
                    to="/dashboard" 
                    className="text-white mr-4 flex items-center hover:text-gray-300 transition duration-200"
                >
                    <FaHardHat className="mr-2" /> Obras
                </Link>
                {user?.role === 'admin' && (
                    <Link 
                        to="/user-management" 
                        className="text-white mr-4 flex items-center hover:text-gray-300 transition duration-200"
                    >
                        <FaUser className="mr-2" /> Usuarios
                    </Link>
                )}
            </div>

            <div className="flex items-center">
                <Link 
                    to="/me" 
                    className="text-white mr-4 flex items-center hover:text-gray-300 transition duration-200"
                >
                    <FaUser className="mr-2" /> Mi Perfil
                </Link>
                <button 
                    onClick={handleLogout} 
                    className="text-white flex items-center hover:text-gray-300 transition duration-200"
                >
                    <FaSignOutAlt className="mr-2" /> Cerrar Sesión
                </button>
            </div>
        </nav>
    );
};

export default Navbar;
