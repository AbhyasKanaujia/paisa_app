import React, { useState } from 'react';
import api from '../api';

let lastUsedExpenseDate = new Date().toISOString().substring(0, 10);

function ExpenseForm() {
    const [form, setForm] = useState({
        amount: '',
        category: '',
        date: lastUsedExpenseDate,
        note: ''
    });

    const handleChange = e => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        if (name === 'date') lastUsedExpenseDate = value;
    };

    const handleSubmit = async e => {
        e.preventDefault();
        try {
            await api.post('/expense', form);
            setForm({ amount: '', category: '', date: lastUsedExpenseDate, note: '' });
            document.getElementById('expense-amount').focus();
        } catch (err) {
            alert('Failed to add expense');
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>Add Expense</h2>
            <input
                id="expense-amount"
                name="amount"
                type="number"
                placeholder="Amount"
                value={form.amount}
                onChange={handleChange}
                required
            /><br/>
            <input
                name="category"
                placeholder="Category"
                value={form.category}
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
            <button type="submit">Add Expense</button>
        </form>
    );
}

export default ExpenseForm;
