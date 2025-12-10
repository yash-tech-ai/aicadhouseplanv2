import { create } from 'zustand';
import { Drawing, DrawingCategory } from '@/types';
import api from '@/services/api';

interface DrawingState {
  drawings: Drawing[];
  categories: DrawingCategory[];
  currentDrawing: Drawing | null;
  isLoading: boolean;
  error: string | null;

  fetchDrawings: (params?: any) => Promise<void>;
  fetchCategories: () => Promise<void>;
  fetchDrawing: (id: string) => Promise<void>;
  uploadDrawing: (formData: FormData) => Promise<Drawing>;
  deleteDrawing: (id: string) => Promise<void>;
  setCurrentDrawing: (drawing: Drawing | null) => void;
  clearError: () => void;
}

export const useDrawingStore = create<DrawingState>((set) => ({
  drawings: [],
  categories: [],
  currentDrawing: null,
  isLoading: false,
  error: null,

  fetchDrawings: async (params?: any) => {
    set({ isLoading: true, error: null });
    try {
      const drawings = await api.getDrawings(params);
      set({ drawings, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch drawings',
        isLoading: false,
      });
    }
  },

  fetchCategories: async () => {
    try {
      const categories = await api.getCategories();
      set({ categories });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch categories',
      });
    }
  },

  fetchDrawing: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const drawing = await api.getDrawing(id);
      set({ currentDrawing: drawing, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch drawing',
        isLoading: false,
      });
    }
  },

  uploadDrawing: async (formData: FormData) => {
    set({ isLoading: true, error: null });
    try {
      const drawing = await api.uploadDrawing(formData);
      set((state) => ({
        drawings: [drawing, ...state.drawings],
        isLoading: false,
      }));
      return drawing;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to upload drawing',
        isLoading: false,
      });
      throw error;
    }
  },

  deleteDrawing: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await api.deleteDrawing(id);
      set((state) => ({
        drawings: state.drawings.filter((d) => d.id !== id),
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to delete drawing',
        isLoading: false,
      });
      throw error;
    }
  },

  setCurrentDrawing: (drawing) => set({ currentDrawing: drawing }),
  clearError: () => set({ error: null }),
}));
