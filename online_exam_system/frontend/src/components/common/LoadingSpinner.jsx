// src/components/common/LoadingSpinner.jsx
import React from 'react';

export default function LoadingSpinner() {
    return (
        <div className="flex justify-center items-center h-full p-8">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-500"></div>
        </div>
    );
}