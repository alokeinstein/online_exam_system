// src/pages/ResultsPage.jsx
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { examService } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';

export default function ResultsPage({ resultId, navigate }) {
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchResult = async () => {
            try {
                const data = await examService.getResultDetails(resultId);
                setResult(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchResult();
    }, [resultId]);

    if (loading) return <LoadingSpinner />;
    if (error) return <ErrorMessage message={error} />;
    if (!result) return <p>No result found.</p>;

    const { score, summary, course_name } = result;
    const totalQuestions = summary.length;
    const percentage = totalQuestions > 0 ? ((score / totalQuestions) * 100).toFixed(2) : 0;
    const chartData = [
        { name: 'Correct', value: score, fill: '#4ade80' },
        { name: 'Incorrect', value: totalQuestions - score, fill: '#f87171' }
    ];

    return (
        <div className="space-y-8">
            <div className="text-center bg-white p-8 rounded-lg shadow-xl">
                <h1 className="text-4xl font-bold mb-2 text-gray-800">Exam Result</h1>
                <p className="text-xl text-gray-600 mb-6">{course_name}</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                    <div className="bg-blue-100 p-4 rounded-lg"><p className="text-lg font-semibold text-blue-800">Total Questions</p><p className="text-3xl font-bold text-blue-900">{totalQuestions}</p></div>
                    <div className="bg-green-100 p-4 rounded-lg"><p className="text-lg font-semibold text-green-800">Correct Answers</p><p className="text-3xl font-bold text-green-900">{score}</p></div>
                    <div className="bg-yellow-100 p-4 rounded-lg"><p className="text-lg font-semibold text-yellow-800">Score</p><p className="text-3xl font-bold text-yellow-900">{percentage}%</p></div>
                </div>
                <div className="h-80 mt-8">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} layout="vertical" margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" domain={[0, totalQuestions]} />
                            <YAxis type="category" dataKey="name" width={80} />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="value" barSize={60} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold mb-4 text-gray-800">Answer Summary</h2>
                <div className="space-y-6">
                    {summary.map((item, index) => (
                        <div key={item.id} className={`p-4 rounded-lg border-l-4 ${item.is_correct ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
                            <p className="font-semibold text-gray-800">Q{index + 1}: {item.question_text}</p>
                            <p className="mt-2 text-sm">Your answer: <span className={`font-medium ${item.is_correct ? 'text-green-700' : 'text-red-700'}`}>{item.options[item.selected_option] ?? 'Not Answered'}</span></p>
                            {!item.is_correct && (
                                <p className="mt-1 text-sm text-green-700">Correct answer: <span className="font-medium">{item.options[item.correct_option]}</span></p>
                            )}
                        </div>
                    ))}
                </div>
            </div>
            <div className="text-center mt-8">
                <button onClick={() => navigate('DASHBOARD')} className="bg-indigo-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-indigo-700 transition-colors">
                    Back to Dashboard
                </button>
            </div>
        </div>
    );
}
