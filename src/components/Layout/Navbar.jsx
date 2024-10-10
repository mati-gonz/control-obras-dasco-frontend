// src/components/Layout/Navbar.jsx
import { Link } from 'react-router-dom';
import { FaHardHat, FaUser, FaSignOutAlt } from 'react-icons/fa';
import { useAuth } from '../../context/useAuth';  // Usar el contexto de autenticación
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
    const { user, logout } = useAuth();  // Obtener el usuario y la función de logout
    const navigate = useNavigate();  // useNavigate está dentro de un Router

    const handleLogout = () => {
        logout();  // Llama la función logout del contexto
        navigate('/', { replace: true });  // Después de cerrar sesión, navega al login
    };

    return (
        <nav className="bg-blue-500 p-4 flex justify-between items-center">
            <div className="flex items-center">
                <Link to="/dashboard" className="text-white mr-4 flex items-center">
                    <FaHardHat className="mr-2" /> Obras
                </Link>
                {user?.role === 'admin' && (
                    <Link to="/user-management" className="text-white mr-4 flex items-center">
                        <FaUser className="mr-2" /> Usuarios
                    </Link>
                )}
            </div>
            <button onClick={handleLogout} className="text-white flex items-center">
                <FaSignOutAlt className="mr-2" /> Cerrar Sesión
            </button>
        </nav>
    );
};

export default Navbar;
