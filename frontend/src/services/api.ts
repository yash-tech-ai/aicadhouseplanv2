import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor - add auth token
    this.api.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('token');
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error: AxiosError) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor - handle errors
    this.api.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Unauthorized - clear token and redirect to login
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth
  async login(email: string, password: string) {
    const response = await this.api.post('/auth/login-direct', { email, password });
    return response.data;
  }

  async register(data: any) {
    const response = await this.api.post('/auth/register', data);
    return response.data;
  }

  // Drawings
  async getDrawings(params?: any) {
    const response = await this.api.get('/drawings', { params });
    return response.data;
  }

  async getDrawing(id: string) {
    const response = await this.api.get(`/drawings/${id}`);
    return response.data;
  }

  async uploadDrawing(formData: FormData) {
    const response = await this.api.post('/drawings/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async searchDrawings(criteria: any) {
    const response = await this.api.get('/drawings/search', { params: criteria });
    return response.data;
  }

  async deleteDrawing(id: string) {
    const response = await this.api.delete(`/drawings/${id}`);
    return response.data;
  }

  // Categories
  async getCategories() {
    const response = await this.api.get('/drawings/categories');
    return response.data;
  }

  // CAD
  async getCADMetadata(drawingId: string) {
    const response = await this.api.get(`/cad/metadata/${drawingId}`);
    return response.data;
  }

  async getCADParameters(drawingId: string) {
    const response = await this.api.get(`/cad/parameters/${drawingId}`);
    return response.data;
  }

  // Matching
  async findMatches(paramsOrDrawingId: any, options?: any) {
    // Support both parameter-based search and drawing-based matching
    if (typeof paramsOrDrawingId === 'string') {
      // Drawing ID provided
      const response = await this.api.get(`/matching/find/${paramsOrDrawingId}`, { params: options });
      return response.data;
    } else {
      // Parameters provided for search
      const response = await this.api.post('/matching/find-by-params', paramsOrDrawingId);
      return response.data;
    }
  }

  // AI
  async suggestLayouts(params: any) {
    const response = await this.api.post('/ai/suggest-layouts', params);
    return response.data;
  }

  async getLayoutSuggestions(params: any) {
    const response = await this.api.post('/ai/suggest-layouts', params);
    return response.data;
  }

  async getAiSuggestions(params: any) {
    const response = await this.api.post('/ai/suggest-room-placement', params);
    return response.data;
  }

  async optimizeLayout(drawingId: string, params: any) {
    const response = await this.api.post(`/ai/optimize/${drawingId}`, params);
    return response.data;
  }

  async suggestRoomPlacement(params: any) {
    const response = await this.api.post('/ai/suggest-room-placement', params);
    return response.data;
  }

  // Rules
  async getRules(params?: any) {
    const response = await this.api.get('/rules', { params });
    return response.data;
  }

  async getRule(id: string) {
    const response = await this.api.get(`/rules/${id}`);
    return response.data;
  }

  async createRule(data: any) {
    const response = await this.api.post('/rules', data);
    return response.data;
  }

  async updateRule(id: string, data: any) {
    const response = await this.api.patch(`/rules/${id}`, data);
    return response.data;
  }

  async deleteRule(id: string) {
    const response = await this.api.delete(`/rules/${id}`);
    return response.data;
  }

  async validateDrawing(drawingId: string) {
    const response = await this.api.post(`/rules/validate/${drawingId}`);
    return response.data;
  }

  async testRule(ruleData: any, testData: any) {
    const response = await this.api.post('/rules/test', { rule: ruleData, testData });
    return response.data;
  }

  // Admin
  async getStatistics() {
    const response = await this.api.get('/admin/statistics');
    return response.data;
  }

  async getParameters() {
    const response = await this.api.get('/admin/parameters');
    return response.data;
  }

  async createParameter(data: any) {
    const response = await this.api.post('/admin/parameters', data);
    return response.data;
  }
}

export const api = new ApiService();
export default api;
