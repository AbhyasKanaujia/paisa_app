import React, { useEffect, useState } from 'react';
import api from '../api';

function Summary() {
    const [summary, setSummary] = useState({
        totalIncome: 0,
        totalExpense: 0,
        balance: 0
    });

    const fetchSummary = async () => {
        try {
            const res = await api.get('/summary');
            setSummary(res.data);
        } catch (err) {
            alert('Failed to fetch summary');
        }
    };

    useEffect(() => {
        fetchSummary();
        const interval = setInterval(fetchSummary, 3000); // auto-refresh
        return () => clearInterval(interval);
    }, []);

    return (
        <div style={{ marginTop: '2rem' }}>
            <h2>Summary</h2>
            <p><strong>Total Income:</strong> ₹{summary.totalIncome}</p>
            <p><strong>Total Expense:</strong> ₹{summary.totalExpense}</p>
            <p><strong>Balance:</strong> ₹{summary.balance}</p>
        </div>
    );
}

export default Summary;
