// src/context/useAuth.js

import { useContext } from 'react';
import AuthContext from './AuthContext';  // Importa el contexto

export const useAuth = () => {
    return useContext(AuthContext);
};
