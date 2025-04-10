import React, { useState, useEffect } from 'react';
import api from '../api';

let lastUsedIncomeDate = new Date().toISOString().substring(0, 10);

function IncomeForm() {
    const [form, setForm] = useState({
        amount: '',
        source: '',
        date: lastUsedIncomeDate,
        note: ''
    });

    const handleChange = e => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        if (name === 'date') lastUsedIncomeDate = value;
    };

    const handleSubmit = async e => {
        e.preventDefault();
        try {
            await api.post('/income', form);
            setForm({ amount: '', source: '', date: lastUsedIncomeDate, note: '' });
            document.getElementById('income-amount').focus();
        } catch (err) {
            alert('Failed to add income');
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>Add Income</h2>
            <input
                id="income-amount"
                name="amount"
                type="number"
                placeholder="Amount"
                value={form.amount}
                onChange={handleChange}
                required
            /><br/>
            <input
                name="source"
                placeholder="Source"
                value={form.source}
                onChange={handleChange}
            /><br/>
            <input
                name="date"
                type="date"
                value={form.date}
                onChange={handleChange}
            /><br/>
            <input
                name="note"
                placeholder="Note"
                value={form.note}
                onChange={handleChange}
            /><br/>
            <button type="submit">Add Income</button>
        </form>
    );
}

export default IncomeForm;
