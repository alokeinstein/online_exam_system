// src/pages/AuthPage.jsx
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth'; // <-- Updated import path
import ErrorMessage from '../components/common/ErrorMessage';

export default function AuthPage() {
    const [isLoginView, setIsLoginView] = useState(true);
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, registerAndLogin } = useAuth();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError(''); // Clear error on new input
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            if (isLoginView) {
                await login({ email: formData.email, password: formData.password });
            } else {
                await registerAndLogin(formData);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
                <h2 className="text-3xl font-bold text-center text-gray-800">
                    {isLoginView ? 'Welcome Back!' : 'Create Your Account'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {!isLoginView && (
                        <div>
                            <label className="text-sm font-bold text-gray-600 block">Full Name</label>
                            <input type="text" name="name" placeholder="John Doe" required className="w-full p-2 border border-gray-300 rounded-lg mt-1" onChange={handleChange} />
                        </div>
                    )}
                     <div>
                        <label className="text-sm font-bold text-gray-600 block">Email Address</label>
                        <input type="email" name="email" placeholder="you@example.com" required className="w-full p-2 border border-gray-300 rounded-lg mt-1" onChange={handleChange} />
                    </div>
                     <div>
                        <label className="text-sm font-bold text-gray-600 block">Password</label>
                        <input type="password" name="password" placeholder="••••••••" required className="w-full p-2 border border-gray-300 rounded-lg mt-1" onChange={handleChange} />
                    </div>
                    
                    {error && <ErrorMessage message={error} />}

                    <button type="submit" disabled={loading} className="w-full py-3 px-4 font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-300 transition-colors">
                        {loading ? 'Processing...' : (isLoginView ? 'Login' : 'Create Account')}
                    </button>
                </form>
                <p className="text-sm text-center text-gray-600">
                    {isLoginView ? "Don't have an account?" : "Already have an account?"}
                    <button onClick={() => setIsLoginView(!isLoginView)} className="ml-1 font-semibold text-indigo-600 hover:underline">
                        {isLoginView ? 'Sign Up' : 'Login'}
                    </button>
                </p>
            </div>
        </div>
    );
}
