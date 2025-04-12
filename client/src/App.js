import React from 'react';
import IncomeForm from './components/IncomeForm';
import ExpenseForm from './components/ExpenseForm';
import Summary from './components/Summary';
import TransactionList from './components/TransactionList';


function App() {
  return (
      <div style={{ padding: '1rem' }}>
        <h1>Budget Manager</h1>
        <div style={{ display: 'flex', gap: '2rem' }}>
          <IncomeForm />
          <ExpenseForm />
        </div>
        <Summary />
        <TransactionList />
      </div>
  );
}

export default App;
