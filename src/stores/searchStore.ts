import { create } from 'zustand';
interface SearchStore {
  isOpen: boolean;
  query: string;
  setQuery: (query: string) => void;
  openSearch: () => void;
  closeSearch: () => void;
  toggleSearch: () => void;
}
export const useSearchStore = create<SearchStore>(set => ({
  isOpen: false,
  query: '',
  setQuery: query => set({
    query
  }),
  openSearch: () => set({
    isOpen: true
  }),
  closeSearch: () => set({
    isOpen: false,
    query: ''
  }),
  toggleSearch: () => set(state => ({
    isOpen: !state.isOpen
  }))
}));