import React, { useState, useEffect, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// --- Mock API Client ---
// In a real app, this would be in a separate file (e.g., api.js)
// and would use a library like axios.
const API_BASE_URL = 'http://localhost:3001/api'; // Your backend URL

const apiClient = {
    getCourses: () => fetch(`${API_BASE_URL}/courses`).then(res => res.json()),
    getQuestions: (courseId, page = 1) => fetch(`${API_BASE_URL}/questions/${courseId}?page=${page}&limit=5`).then(res => res.json()),
    saveAnswer: (payload) => fetch(`${API_BASE_URL}/answers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    }).then(res => res.json()),
    submitExam: (payload) => fetch(`${API_BASE_URL}/exams/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    }).then(res => res.json()),
    getResult: (candidateId, courseId) => fetch(`${API_BASE_URL}/results/${candidateId}/${courseId}`).then(res => res.json()),
};

// --- Helper Components ---

const Timer = ({ duration, onTimeUp }) => {
    const [timeLeft, setTimeLeft] = useState(duration);

    useEffect(() => {
        if (timeLeft <= 0) {
            onTimeUp();
            return;
        }

        const intervalId = setInterval(() => {
            setTimeLeft(timeLeft - 1);
        }, 1000);

        return () => clearInterval(intervalId);
    }, [timeLeft, onTimeUp]);

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    return (
        <div className="text-2xl font-bold text-indigo-600">
            Time Left: {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </div>
    );
};

const LoadingSpinner = () => (
    <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-500"></div>
    </div>
);

const ErrorMessage = ({ message }) => (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg" role="alert">
        <strong className="font-bold">Error: </strong>
        <span className="block sm:inline">{message}</span>
    </div>
);


// --- Main Components ---

const CourseSelection = ({ onStartExam }) => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        apiClient.getCourses()
            .then(setCourses)
            .catch(err => setError('Could not fetch courses. Please make sure the backend server is running.'))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <LoadingSpinner />;
    if (error) return <ErrorMessage message={error} />;

    return (
        <div className="text-center">
            <h1 className="text-4xl font-bold mb-6 text-gray-800">Select an Exam</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map(course => (
                    <div key={course.id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow">
                        <h2 className="text-2xl font-semibold mb-4 text-gray-700">{course.name}</h2>
                        <button
                            onClick={() => onStartExam(course.id, course.name)}
                            className="w-full bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 transition-colors"
                        >
                            Start Exam
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

const Exam = ({ courseId, courseName, candidateId, onFinishExam }) => {
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState({}); // { questionId: selectedOptionIndex }
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const EXAM_DURATION = 50 * 60; // 50 questions, 1 minute per question

    const fetchQuestions = useCallback((page) => {
        setLoading(true);
        apiClient.getQuestions(courseId, page)
            .then(data => {
                setQuestions(data.questions);
                setTotalPages(data.totalPages);
                setCurrentPage(data.currentPage);
            })
            .catch(err => setError('Failed to load questions.'))
            .finally(() => setLoading(false));
    }, [courseId]);

    useEffect(() => {
        fetchQuestions(currentPage);
    }, [currentPage, fetchQuestions]);

    const handleAnswerSelect = (questionId, selectedOption) => {
        const newAnswers = { ...answers, [questionId]: selectedOption };
        setAnswers(newAnswers);

        // Save answer to backend in real-time
        apiClient.saveAnswer({ candidateId, questionId, selectedOption })
            .catch(err => console.error("Failed to save answer:", err)); // Log error but don't block user
    };
    
    const handleSubmit = async () => {
        if (window.confirm('Are you sure you want to submit the exam?')) {
            setLoading(true);
            try {
                await apiClient.submitExam({ candidateId, courseId });
                onFinishExam();
            } catch (err) {
                setError('There was an error submitting your exam.');
                setLoading(false);
            }
        }
    };

    if (error) return <ErrorMessage message={error} />;

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-md">
                <h1 className="text-3xl font-bold text-gray-800">{courseName} Exam</h1>
                <Timer duration={EXAM_DURATION} onTimeUp={handleSubmit} />
            </div>

            {loading ? <LoadingSpinner /> : (
                <div className="bg-white p-6 rounded-lg shadow-md">
                    {questions.map((q, index) => (
                        <div key={q.id} className="mb-8 border-b pb-6 last:border-b-0 last:pb-0">
                            <p className="text-xl font-semibold mb-4 text-gray-700">
                                Question {(currentPage - 1) * 5 + index + 1}: {q.question_text}
                            </p>
                            <div className="space-y-3">
                                {q.options.map((option, i) => (
                                    <label key={i} className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${answers[q.id] === i ? 'bg-indigo-100 border-indigo-400' : 'bg-gray-50 hover:bg-gray-100 border-gray-200'}`}>
                                        <input
                                            type="radio"
                                            name={`question-${q.id}`}
                                            checked={answers[q.id] === i}
                                            onChange={() => handleAnswerSelect(q.id, i)}
                                            className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                                        />
                                        <span className="ml-4 text-gray-800">{option}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="flex justify-between items-center mt-6">
                <button
                    onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                    disabled={currentPage === 1 || loading}
                    className="bg-gray-300 text-gray-800 font-bold py-2 px-6 rounded-lg hover:bg-gray-400 disabled:bg-gray-200 disabled:cursor-not-allowed transition-colors"
                >
                    Previous
                </button>
                <span className="text-lg font-medium">Page {currentPage} of {totalPages}</span>
                <button
                    onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                    disabled={currentPage === totalPages || loading}
                    className="bg-gray-300 text-gray-800 font-bold py-2 px-6 rounded-lg hover:bg-gray-400 disabled:bg-gray-200 disabled:cursor-not-allowed transition-colors"
                >
                    Next
                </button>
            </div>
            
            {currentPage === totalPages && (
                 <div className="text-center mt-8">
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="bg-green-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition-transform transform hover:scale-105"
                    >
                        {loading ? 'Submitting...' : 'Finish & Submit Exam'}
                    </button>
                </div>
            )}
        </div>
    );
};

const Results = ({ candidateId, courseId, courseName, onRestart }) => {
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        apiClient.getResult(candidateId, courseId)
            .then(setResult)
            .catch(err => setError('Could not fetch results.'))
            .finally(() => setLoading(false));
    }, [candidateId, courseId]);

    if (loading) return <LoadingSpinner />;
    if (error) return <ErrorMessage message={error} />;
    if (!result) return <p>No result found.</p>;

    const { score, summary } = result;
    const totalQuestions = summary.length;
    const percentage = totalQuestions > 0 ? ((score / totalQuestions) * 100).toFixed(2) : 0;
    
    const chartData = [
        { name: 'Correct', value: score, fill: '#4ade80' },
        { name: 'Incorrect', value: totalQuestions - score, fill: '#f87171' },
    ];

    return (
        <div className="space-y-8">
            <div className="text-center bg-white p-8 rounded-lg shadow-xl">
                <h1 className="text-4xl font-bold text-gray-800 mb-2">Exam Result</h1>
                <p className="text-xl text-gray-600 mb-6">{courseName}</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                    <div className="bg-blue-100 p-4 rounded-lg">
                        <p className="text-lg font-semibold text-blue-800">Total Questions</p>
                        <p className="text-3xl font-bold text-blue-900">{totalQuestions}</p>
                    </div>
                    <div className="bg-green-100 p-4 rounded-lg">
                        <p className="text-lg font-semibold text-green-800">Correct Answers</p>
                        <p className="text-3xl font-bold text-green-900">{score}</p>
                    </div>
                    <div className="bg-yellow-100 p-4 rounded-lg">
                        <p className="text-lg font-semibold text-yellow-800">Score</p>
                        <p className="text-3xl font-bold text-yellow-900">{percentage}%</p>
                    </div>
                </div>
                 <div className="h-80 mt-8">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} layout="vertical" margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" />
                            <YAxis type="category" dataKey="name" />
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
                            <p className="mt-2 text-sm">Your answer: <span className={`font-medium ${item.selected_option === item.correct_option ? 'text-green-700' : 'text-red-700'}`}>{item.options[item.selected_option] ?? 'Not Answered'}</span></p>
                            {!item.is_correct && (
                                <p className="mt-1 text-sm text-green-700">Correct answer: <span className="font-medium">{item.options[item.correct_option]}</span></p>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <div className="text-center mt-8">
                <button
                    onClick={onRestart}
                    className="bg-indigo-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                    Take Another Exam
                </button>
            </div>
        </div>
    );
};


// --- App Container ---

export default function App() {
    // For this example, we'll use a static candidate ID.
    // In a real app, this would come from an authentication context after login.
    const CANDIDATE_ID = 1;

    const [appState, setAppState] = useState('COURSE_SELECTION'); // COURSE_SELECTION, IN_EXAM, VIEW_RESULTS
    const [selectedCourse, setSelectedCourse] = useState({ id: null, name: '' });

    const handleStartExam = (courseId, courseName) => {
        setSelectedCourse({ id: courseId, name: courseName });
        setAppState('IN_EXAM');
    };

    const handleFinishExam = () => {
        setAppState('VIEW_RESULTS');
    };

    const handleRestart = () => {
        setSelectedCourse({ id: null, name: '' });
        setAppState('COURSE_SELECTION');
    };

    const renderContent = () => {
        switch (appState) {
            case 'IN_EXAM':
                return <Exam courseId={selectedCourse.id} courseName={selectedCourse.name} candidateId={CANDIDATE_ID} onFinishExam={handleFinishExam} />;
            case 'VIEW_RESULTS':
                return <Results candidateId={CANDIDATE_ID} courseId={selectedCourse.id} courseName={selectedCourse.name} onRestart={handleRestart} />;
            case 'COURSE_SELECTION':
            default:
                return <CourseSelection onStartExam={handleStartExam} />;
        }
    };

    return (
        <div className="bg-gray-100 min-h-screen font-sans">
            <header className="bg-white shadow-md">
                <div className="container mx-auto px-4 py-4">
                    <h1 className="text-2xl font-bold text-indigo-600">Online Exam Platform</h1>
                </div>
            </header>
            <main className="container mx-auto px-4 py-8">
                {renderContent()}
            </main>
            <footer className="text-center py-4 text-gray-500 text-sm">
                <p>&copy; {new Date().getFullYear()} Online Exam System. All rights reserved.</p>
            </footer>
        </div>
    );
}
