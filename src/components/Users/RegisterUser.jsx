import { useAuth } from '../../context/useAuth';
import { useNavigate } from 'react-router-dom';
import RegisterForm from '../Auth/RegisterForm';
import { useEffect } from 'react';

const RegisterUser = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!user || user.role !== 'admin') {
            navigate('/');
        }
    }, [user, navigate]);

    return (
        <RegisterForm isAdmin={true} />
    );
};

export default RegisterUser;
