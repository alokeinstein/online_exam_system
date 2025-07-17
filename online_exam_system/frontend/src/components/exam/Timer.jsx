
import React, { useState, useEffect } from 'react';

export default function Timer({ duration, onTimeUp }) {
    const [timeLeft, setTimeLeft] = useState(duration);

    useEffect(() => {
        if (timeLeft <= 0) {
            onTimeUp();
            return;
        }

        const intervalId = setInterval(() => {
            setTimeLeft(prevTime => prevTime - 1);
        }, 1000);

        return () => clearInterval(intervalId);
    }, [timeLeft, onTimeUp]);

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    return (
        <div className="text-2xl font-bold text-indigo-600">
            Time: {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </div>
    );
}
