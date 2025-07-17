import React from 'react';
import AuthProvider from './providers/AuthProvider'; // <-- Updated import path
import AppRouter from './router/AppRouter';

export default function App() {
    return (
        <AuthProvider>
            <AppRouter />
        </AuthProvider>
    );
}
