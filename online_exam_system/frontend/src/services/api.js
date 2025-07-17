const API_BASE_URL = 'http://localhost:3001/api';

const getAuthToken = () => {
    const auth = localStorage.getItem('auth');
    return auth ? JSON.parse(auth).token : null;
};

const request = async (endpoint, method = 'GET', body = null) => {
    const headers = { 'Content-Type': 'application/json' };
    const token = getAuthToken();
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        method,
        headers,
    };

    if (body) {
        config.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'An API error occurred');
    }
    return data;
};

export const authService = {
    login: (credentials) => request('/auth/login', 'POST', credentials),
    register: (userData) => request('/auth/register', 'POST', userData),
};

export const courseService = {
    getCourses: () => request('/courses'),
    getQuestions: (courseId, page = 1) => request(`/questions/${courseId}?page=${page}&limit=5`),
};

export const examService = {
    saveAnswer: (payload) => request('/answers', 'POST', payload),
    submitExam: (payload) => request('/exams/submit', 'POST', payload),
    getMyResults: () => request('/my-results'),
    getResultDetails: (resultId) => request(`/results/${resultId}`),
};
