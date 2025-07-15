import { create } from 'zustand';

const usePinnedContextStore = create((set) => ({
  pinnedAccount: null,
  pinnedTags: [],

  pinContext: ({ account, tags }) =>
    set(() => ({
      pinnedAccount: account || null,
      pinnedTags: tags || [],
    })),

  unpinAll: () =>
    set(() => ({
      pinnedAccount: null,
      pinnedTags: [],
    })),
}));

export default usePinnedContextStore;
