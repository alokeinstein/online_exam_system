import React, { useState } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { authService } from '../services/api';

export default function AuthProvider({ children }) {
    const [auth, setAuth] = useState(() => {
        const storedAuth = localStorage.getItem('auth');
        return storedAuth ? JSON.parse(storedAuth) : null;
    });

    const login = async (credentials) => {
        const authData = await authService.login(credentials);
        localStorage.setItem('auth', JSON.stringify(authData));
        setAuth(authData);
        return authData;
    };
    
    const registerAndLogin = async (userData) => {
        await authService.register(userData);
        const authData = await login({ email: userData.email, password: userData.password });
        return authData;
    };

    const logout = () => {
        localStorage.removeItem('auth');
        setAuth(null);
    };

    return (
        <AuthContext.Provider value={{ auth, login, registerAndLogin, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
