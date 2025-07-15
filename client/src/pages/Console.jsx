import React from 'react';
import EntryBar from '../components/EntryBar';
import PinnedContextBar from '../components/PinnedContextBar';
import RecentEntryList from '../components/RecentEntryList';

function Console() {
  return (
    <div style={{ padding: '2rem' }}>
      <h2 className="mb-4">Paisa Console</h2>
      <PinnedContextBar />
      <EntryBar />
      <RecentEntryList />
    </div>
  );
}

export default Console;
