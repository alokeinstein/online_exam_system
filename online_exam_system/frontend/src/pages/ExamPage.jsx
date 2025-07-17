import React, { useState, useEffect, useCallback } from 'react';
import { courseService, examService } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import Timer from '../components/exam/Timer';

export default function ExamPage({ course, navigate }) {
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const EXAM_DURATION = 50 * 60; // 50 minutes for 50 questions

    const fetchQuestions = useCallback(async (page) => {
        setLoading(true);
        try {
            const data = await courseService.getQuestions(course.id, page);
            setQuestions(data.questions);
            setTotalPages(data.totalPages);
            setCurrentPage(data.currentPage);
        } catch (err) {
            setError('Failed to load questions.',err);
        } finally {
            setLoading(false);
        }
    }, [course.id]);

    useEffect(() => {
        fetchQuestions(currentPage);
    }, [currentPage, fetchQuestions]);

    const handleAnswerSelect = (questionId, selectedOption) => {
        setAnswers(prev => ({ ...prev, [questionId]: selectedOption }));
        examService.saveAnswer({ questionId, selectedOption }).catch(err => console.error("Failed to save answer:", err));
    };

    const handleSubmit = useCallback(async () => {
        if (window.confirm('Are you sure you want to submit the exam?')) {
            setLoading(true);
            try {
                const result = await examService.submitExam({ courseId: course.id });
                navigate('RESULTS', { resultId: result.id });
            } catch (err) {
                setError('There was an error submitting your exam.',err);
                setLoading(false);
            }
        }
    }, [course.id, navigate]);

    if (error) return <ErrorMessage message={error} />;

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-md">
                <h1 className="text-3xl font-bold text-gray-800">{course.name} Exam</h1>
                <Timer duration={EXAM_DURATION} onTimeUp={handleSubmit} />
            </div>
            {loading ? <LoadingSpinner /> : (
                <div className="bg-white p-6 rounded-lg shadow-md">
                    {questions.map((q, index) => (
                        <div key={q.id} className="mb-8 border-b pb-6 last:border-b-0 last:pb-0">
                            <p className="text-xl font-semibold mb-4 text-gray-700">Q{(currentPage - 1) * 5 + index + 1}: {q.question_text}</p>
                            <div className="space-y-3">
                                {q.options.map((option, i) => (
                                    <label key={i} className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${answers[q.id] === i ? 'bg-indigo-100 border-indigo-400' : 'bg-gray-50 hover:bg-gray-100 border-gray-200'}`}>
                                        <input type="radio" name={`q-${q.id}`} checked={answers[q.id] === i} onChange={() => handleAnswerSelect(q.id, i)} className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300"/>
                                        <span className="ml-4 text-gray-800">{option}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
            <div className="flex justify-between items-center mt-6">
                <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1 || loading} className="bg-gray-300 text-gray-800 font-bold py-2 px-6 rounded-lg hover:bg-gray-400 disabled:bg-gray-200 disabled:cursor-not-allowed transition-colors">Previous</button>
                <span className="text-lg font-medium">Page {currentPage} of {totalPages}</span>
                <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages || loading} className="bg-gray-300 text-gray-800 font-bold py-2 px-6 rounded-lg hover:bg-gray-400 disabled:bg-gray-200 disabled:cursor-not-allowed transition-colors">Next</button>
            </div>
            {currentPage === totalPages && (
                 <div className="text-center mt-8">
                    <button onClick={handleSubmit} disabled={loading} className="bg-green-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition-transform transform hover:scale-105">
                        {loading ? 'Submitting...' : 'Finish & Submit Exam'}
                    </button>
                </div>
            )}
        </div>
    );
}

