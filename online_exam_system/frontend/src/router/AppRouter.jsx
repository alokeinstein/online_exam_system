import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import AuthPage from '../pages/AuthPage';
import HomePage from '../pages/HomePage.jsx';
import DashboardPage from '../pages/DashboardPage.jsx';
import ExamPage from '../pages/ExamPage';
import ResultsPage from '../pages/ResultsPage';
import Header from '../components/common/Header';

export default function AppRouter() {
    const { auth } = useAuth();
    const [page, setPage] = useState('AUTH'); 
    const [pageProps, setPageProps] = useState({});

    useEffect(() => {
        setPage(auth ? 'HOME' : 'AUTH');
    }, [auth]);

    const navigate = (targetPage, props = {}) => {
        setPage(targetPage);
        setPageProps(props);
    };

    const renderContent = () => {
        if (!auth) return <AuthPage />;
        
        switch (page) {
            case 'DASHBOARD': return <DashboardPage navigate={navigate} />;
            case 'EXAM': return <ExamPage {...pageProps} navigate={navigate} />;
            case 'RESULTS': return <ResultsPage {...pageProps} navigate={navigate} />;
            case 'HOME':
            default:
                return <HomePage navigate={navigate} />;
        }
    };

    return (
        <div className="bg-gray-100 min-h-screen font-sans">
            <Header navigate={navigate} />
            <main className="container mx-auto px-4 py-8">
                {renderContent()}
            </main>
        </div>
    );
}
