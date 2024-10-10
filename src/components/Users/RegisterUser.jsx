// src/components/Users/RegisterUser.jsx
import { useAuth } from '../../context/useAuth';
import { useNavigate } from 'react-router-dom';
import RegisterForm from '../Auth/RegisterForm';
import { useEffect } from 'react';

const RegisterUser = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        // Redirige si el usuario no es administrador
        if (!user || user.role !== 'admin') {
            navigate('/'); // Redirige al inicio si no es admin
        }
    }, [user, navigate]);

    return (
        <RegisterForm isAdmin={true} />  // Usar RegisterForm con la prop isAdmin
    );
};

export default RegisterUser;
