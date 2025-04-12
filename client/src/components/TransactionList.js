// src/components/TransactionList.js
import React, { useEffect, useState } from 'react';
import api from '../api';

function TransactionList() {
    const [transactions, setTransactions] = useState([]);
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const [loading, setLoading] = useState(false);

    const fetchTransactions = async (pageNum = 1) => {
        try {
            setLoading(true);
            const res = await api.get('/transactions', {
                params: {
                    page: pageNum,
                    limit: 10
                }
            });
            setTransactions(res.data.data);
            setPage(res.data.page);
            setPages(res.data.pages);
        } catch (err) {
            alert('Failed to fetch transactions');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions(page);
    }, [page]);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pages) {
            setPage(newPage);
        }
    };

    return (
        <div style={{ marginTop: '2rem' }}>
            <h2>Transactions</h2>
            {loading ? <p>Loading...</p> : (
                <>
                    <table border="1" cellPadding="8">
                        <thead>
                        <tr>
                            <th>Type</th>
                            <th>Amount</th>
                            <th>Category/Source</th>
                            <th>Date</th>
                            <th>Note</th>
                        </tr>
                        </thead>
                        <tbody>
                        {transactions.map((tx, i) => (
                            <tr key={i}>
                                <td>{tx.type}</td>
                                <td>₹{tx.amount}</td>
                                <td>{tx.type === 'income' ? tx.source : tx.category}</td>
                                <td>{new Date(tx.date).toLocaleDateString()}</td>
                                <td>{tx.note}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>

                    {/* Pagination Controls */}
                    <div style={{ marginTop: '1rem' }}>
                        <button disabled={page === 1} onClick={() => handlePageChange(page - 1)}>Prev</button>
                        {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
                            <button
                                key={p}
                                style={{ fontWeight: p === page ? 'bold' : 'normal' }}
                                onClick={() => handlePageChange(p)}
                            >
                                {p}
                            </button>
                        ))}
                        <button disabled={page === pages} onClick={() => handlePageChange(page + 1)}>Next</button>
                    </div>
                </>
            )}
        </div>
    );
}

export default TransactionList;
