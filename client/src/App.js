import React from 'react';
import IncomeForm from './components/IncomeForm';
import ExpenseForm from './components/ExpenseForm';
import Summary from './components/Summary';

function App() {
  return (
      <div style={{ padding: '1rem' }}>
        <h1>Budget Manager</h1>
        <div style={{ display: 'flex', gap: '2rem' }}>
          <IncomeForm />
          <ExpenseForm />
        </div>
        <Summary />
      </div>
  );
}

export default App;
