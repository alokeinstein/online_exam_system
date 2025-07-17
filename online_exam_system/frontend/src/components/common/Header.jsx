// src/components/common/Header.jsx
import React from 'react';
import { useAuth } from '../../hooks/useAuth'; // <-- Updated import path

export default function Header({ navigate }) {
    const { auth, logout } = useAuth();

    return (
        <header className="bg-white shadow-md sticky top-0 z-10">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center py-4">
                    <div 
                        onClick={() => auth && navigate('HOME')} 
                        className="cursor-pointer"
                        title="Go to Home"
                    >
                        <h1 className="text-2xl font-bold text-indigo-600">Online Exam Platform</h1>
                    </div>
                    {auth && (
                        <nav className="flex items-center space-x-4 md:space-x-6">
                            <button onClick={() => navigate('HOME')} className="text-gray-600 hover:text-indigo-600 font-medium">Home</button>
                            <button onClick={() => navigate('DASHBOARD')} className="text-gray-600 hover:text-indigo-600 font-medium">Dashboard</button>
                            <button onClick={logout} className="bg-indigo-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-600 transition-colors">Logout</button>
                        </nav>
                    )}
                </div>
            </div>
        </header>
    );
}