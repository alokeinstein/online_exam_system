// src/pages/HomePage.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { courseService } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';

export default function HomePage({ navigate }) {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { auth } = useAuth();

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const data = await courseService.getCourses();
                setCourses(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchCourses();
    }, []);

    const handleStart = (course) => {
        navigate('EXAM', { course });
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div className="text-center">
            <h1 className="text-4xl font-bold mb-2 text-gray-800">Welcome, {auth.user.name}!</h1>
            <p className="text-lg text-gray-600 mb-8">Select an exam to begin.</p>
            {error && <ErrorMessage message={error} />}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map(course => (
                    <div key={course.id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow">
                        <h2 className="text-2xl font-semibold mb-4 text-gray-700">{course.name}</h2>
                        <button 
                            onClick={() => handleStart(course)} 
                            className="w-full bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 transition-colors"
                        >
                            Start Exam
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
