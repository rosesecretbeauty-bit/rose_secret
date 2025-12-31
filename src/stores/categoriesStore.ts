// src/stores/categoriesStore.ts
// Store de Zustand para categorías

import { create } from 'zustand';
import {
  getCategories,
  getCategoriesHierarchy,
  getCategoryById,
  getCategoryBySlug,
  getCategoryProducts,
  getAdminCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  Category
} from '../api/categories';

interface CategoriesState {
  // Estado
  categories: Category[];
  categoriesTree: Category[];
  currentCategory: Category | null;
  isLoading: boolean;
  error: string | null;

  // Acciones públicas
  loadCategories: () => Promise<void>;
  loadCategoriesHierarchy: () => Promise<void>;
  loadCategoryById: (id: number) => Promise<void>;
  loadCategoryBySlug: (slug: string) => Promise<void>;
  clearError: () => void;

  // Acciones admin
  loadAdminCategories: () => Promise<void>;
  createCategory: (data: Parameters<typeof createCategory>[0]) => Promise<Category>;
  updateCategory: (id: number, data: Parameters<typeof updateCategory>[1]) => Promise<Category>;
  deleteCategory: (id: number) => Promise<void>;
}

export const useCategoriesStore = create<CategoriesState>((set, get) => ({
  // Estado inicial
  categories: [],
  categoriesTree: [],
  currentCategory: null,
  isLoading: false,
  error: null,

  // Cargar todas las categorías (versión plana)
  loadCategories: async () => {
    set({ isLoading: true, error: null });
    try {
      const categories = await getCategories();
      set({ categories, isLoading: false });
    } catch (error: any) {
      set({
        error: error.message || 'Error al cargar categorías',
        isLoading: false
      });
    }
  },

  // Cargar categorías con jerarquía
  loadCategoriesHierarchy: async () => {
    set({ isLoading: true, error: null });
    try {
      const tree = await getCategoriesHierarchy();
      set({ categoriesTree: tree, isLoading: false });
    } catch (error: any) {
      set({
        error: error.message || 'Error al cargar categorías',
        isLoading: false
      });
    }
  },

  // Cargar categoría por ID
  loadCategoryById: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      const category = await getCategoryById(id);
      set({ currentCategory: category, isLoading: false });
    } catch (error: any) {
      set({
        error: error.message || 'Error al cargar categoría',
        isLoading: false,
        currentCategory: null
      });
    }
  },

  // Cargar categoría por slug
  loadCategoryBySlug: async (slug: string) => {
    set({ isLoading: true, error: null });
    try {
      const category = await getCategoryBySlug(slug);
      set({ currentCategory: category, isLoading: false });
    } catch (error: any) {
      set({
        error: error.message || 'Error al cargar categoría',
        isLoading: false,
        currentCategory: null
      });
    }
  },

  // Limpiar error
  clearError: () => {
    set({ error: null });
  },

  // ============================================
  // ACCIONES ADMIN
  // ============================================

  // Cargar categorías (admin - incluye inactivas)
  loadAdminCategories: async () => {
    set({ isLoading: true, error: null });
    try {
      const categories = await getAdminCategories();
      set({ categories, isLoading: false });
    } catch (error: any) {
      set({
        error: error.message || 'Error al cargar categorías',
        isLoading: false
      });
      throw error;
    }
  },

  // Crear categoría
  createCategory: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const newCategory = await createCategory(data);
      // Recargar categorías después de crear
      await get().loadAdminCategories();
      set({ isLoading: false });
      return newCategory;
    } catch (error: any) {
      set({
        error: error.message || 'Error al crear categoría',
        isLoading: false
      });
      throw error;
    }
  },

  // Actualizar categoría
  updateCategory: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await updateCategory(id, data);
      // Recargar categorías después de actualizar
      await get().loadAdminCategories();
      set({ isLoading: false });
      return updated;
    } catch (error: any) {
      set({
        error: error.message || 'Error al actualizar categoría',
        isLoading: false
      });
      throw error;
    }
  },

  // Eliminar categoría
  deleteCategory: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await deleteCategory(id);
      // Recargar categorías después de eliminar
      await get().loadAdminCategories();
      set({ isLoading: false });
    } catch (error: any) {
      set({
        error: error.message || 'Error al eliminar categoría',
        isLoading: false
      });
      throw error;
    }
  }
}));

