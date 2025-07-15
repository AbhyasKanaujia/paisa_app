import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Console from './pages/Console';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Console />} />
    </Routes>
  );
}

export default App;
