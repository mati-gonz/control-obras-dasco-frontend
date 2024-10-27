import { useState } from 'react';
import { FaHardHat, FaUser, FaSignOutAlt, FaMoneyCheck, FaBars, FaTimes } from 'react-icons/fa';
import { useAuth } from '../../context/useAuth';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/', { replace: true });
    };

    const handleNavigateTransfers = () => {
        if (user?.role === 'admin') {
            navigate('/transfers');
        } else {
            navigate(`/transfers/user/${user.id}`);
        }
    };

    return (
        <nav className="bg-blue-500 p-4 flex justify-between items-center">
            <div className="lg:hidden">
                <button onClick={() => setIsOpen(!isOpen)} className="text-white focus:outline-none">
                    {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
                </button>
            </div>

            <div className="hidden lg:flex items-center space-x-4">
                <Link 
                    to="/dashboard" 
                    className="text-white flex items-center hover:text-gray-300 transition duration-200"
                >
                    <FaHardHat className="mr-2" /> Obras
                </Link>
                {user?.role === 'admin' && (
                    <Link 
                        to="/user-management" 
                        className="text-white flex items-center hover:text-gray-300 transition duration-200"
                    >
                        <FaUser className="mr-2" /> Usuarios
                    </Link>
                )}
                <button
                    onClick={handleNavigateTransfers}
                    className="text-white flex items-center hover:text-gray-300 transition duration-200"
                >
                    <FaMoneyCheck className="mr-2" /> Transferencias
                </button>
            </div>

            <div className="hidden lg:flex items-center space-x-4">
                <Link 
                    to="/me" 
                    className="text-white flex items-center hover:text-gray-300 transition duration-200"
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

            {isOpen && (
                <div className="lg:hidden absolute top-16 left-0 w-full bg-blue-500 flex flex-col space-y-2 p-4 z-10">
                    <Link 
                        to="/dashboard" 
                        className="text-white flex items-center hover:text-gray-300 transition duration-200" 
                        onClick={() => setIsOpen(false)}
                    >
                        <FaHardHat className="mr-2" /> Obras
                    </Link>
                    {user?.role === 'admin' && (
                        <Link 
                            to="/user-management" 
                            className="text-white flex items-center hover:text-gray-300 transition duration-200"
                            onClick={() => setIsOpen(false)}
                        >
                            <FaUser className="mr-2" /> Usuarios
                        </Link>
                    )}
                    <button 
                        onClick={() => { handleNavigateTransfers(); setIsOpen(false); }}
                        className="text-white flex items-center hover:text-gray-300 transition duration-200"
                    >
                        <FaMoneyCheck className="mr-2" /> Transferencias
                    </button>
                    <Link 
                        to="/me" 
                        className="text-white flex items-center hover:text-gray-300 transition duration-200"
                        onClick={() => setIsOpen(false)}
                    >
                        <FaUser className="mr-2" /> Mi Perfil
                    </Link>
                    <button 
                        onClick={() => { handleLogout(); setIsOpen(false); }}
                        className="text-white flex items-center hover:text-gray-300 transition duration-200"
                    >
                        <FaSignOutAlt className="mr-2" /> Cerrar Sesión
                    </button>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
