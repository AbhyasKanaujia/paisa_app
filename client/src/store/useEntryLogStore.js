import { create } from 'zustand';
import { nanoid } from 'nanoid';

const useEntryLogStore = create((set) => ({
  entries: [],

  addEntry: (entry) =>
    set((state) => ({
      entries: [
        {
          ...entry,
          id: nanoid(),
          timestamp: new Date().toISOString(),
        },
        ...state.entries,
      ].slice(0, 10), // Keep only 10 most recent
    })),

  removeEntryById: (id) =>
    set((state) => ({
      entries: state.entries.filter((entry) => entry.id !== id),
    })),
}));

export default useEntryLogStore;
