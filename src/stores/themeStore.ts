import { create } from 'zustand';
import { persist } from 'zustand/middleware';
type Theme = 'light' | 'dark';
interface ThemeStore {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}
export const useThemeStore = create<ThemeStore>()(persist(set => ({
  theme: 'light',
  toggleTheme: () => {
    set(state => {
      const newTheme = state.theme === 'light' ? 'dark' : 'light';

      // Update document class
      if (newTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return {
        theme: newTheme
      };
    });
  },
  setTheme: theme => {
    set({
      theme
    });

    // Update document class
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
}), {
  name: 'rose-secret-theme'
}));