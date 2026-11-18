import axios from 'axios';
import { auth } from '../firebase';
import type { Course, Highlight, User } from '../types';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: tự động đính kèm Firebase ID Token vào Header Authorization
api.interceptors.request.use(
  async (config) => {
    let token = localStorage.getItem('token');
    
    // Nếu firebase auth đã sẵn sàng, lấy token mới nhất (tự động làm mới nếu token cũ hết hạn)
    if (auth.currentUser) {
      try {
        token = await auth.currentUser.getIdToken();
        if (token) {
          localStorage.setItem('token', token);
        }
      } catch (err) {
        console.warn('[API] Không thể làm mới Firebase token:', err);
      }
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: xử lý lỗi tập trung
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error('[API 401] Phiên đăng nhập hết hạn hoặc chưa được xác thực.');
    }
    return Promise.reject(error);
  }
);

// --- AUTH API ---
export const authApi = {
  firebaseLogin: async (data: { firebaseUid: string; email: string; username: string }): Promise<User> => {
    const res = await api.post<User>('/auth/firebase-login', data);
    return res.data;
  },
};

// --- COURSE API ---
export const courseApi = {
  // Lấy danh sách khóa học của user hiện tại (xác thực qua Bearer Token)
  getUserCourses: async (): Promise<Course[]> => {
    const res = await api.get<Course[]>('/courses/user');
    return res.data;
  },

  // Lấy danh sách khóa học cộng đồng (Public)
  getCommunityCourses: async (): Promise<Course[]> => {
    const res = await api.get<Course[]>('/courses/community');
    return res.data;
  },

  // Lấy chi tiết 1 khóa học (bao gồm units và lessons)
  getCourse: async (courseId: number): Promise<Course> => {
    const res = await api.get<Course>(`/courses/${courseId}`);
    return res.data;
  },

  // Yêu cầu AI tạo khóa học bất đồng bộ từ file PDF/DOCX
  generateCourse: async (formData: FormData): Promise<{ courseId: number; status: string; message: string; lessons?: any[] }> => {
    const res = await api.post('/courses/generate', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  // Cập nhật tiến độ học tập (bước cao nhất đã đạt được)
  saveProgress: async (courseId: number, stepIndex: number): Promise<Course> => {
    const res = await api.put<Course>(`/courses/${courseId}/progress?stepIndex=${stepIndex}`);
    return res.data;
  },

  // Xóa khóa học
  deleteCourse: async (courseId: number): Promise<void> => {
    await api.delete(`/courses/${courseId}`);
  },

  // Bật/tắt trạng thái công khai (Public / Private)
  togglePublic: async (courseId: number): Promise<Course> => {
    const res = await api.put<Course>(`/courses/${courseId}/toggle-public`);
    return res.data;
  },

  // Clone một khóa học từ cộng đồng về tủ sách cá nhân
  cloneCourse: async (courseId: number, userId: number): Promise<Course> => {
    const res = await api.post<Course>(`/courses/${courseId}/clone?userId=${userId}`);
    return res.data;
  },
};

// --- CHAT / AI TUTOR API ---
export const chatApi = {
  explainText: async (highlightedText: string, question: string): Promise<string> => {
    const res = await api.post<{ response?: string; error?: string }>('/chat/explain', {
      highlightedText,
      question,
    });
    if (res.data.error) {
      throw new Error(res.data.error);
    }
    return res.data.response || '';
  },
};

// --- HIGHLIGHTS / NOTES API ---
export const highlightApi = {
  getHighlights: async (userId: number, courseId: number): Promise<Highlight[]> => {
    const res = await api.get<Highlight[]>('/highlights', {
      params: { userId, courseId },
    });
    return res.data;
  },

  saveHighlight: async (highlight: { userId: number; courseId: number; text: string; note?: string; color?: string }): Promise<Highlight> => {
    const res = await api.post<Highlight>('/highlights', highlight);
    return res.data;
  },

  deleteHighlight: async (id: number): Promise<void> => {
    await api.delete(`/highlights/${id}`);
  },
};

// --- USER PROFILE & PINNED NOTES API ---
export const userApi = {
  getUser: async (userId: number): Promise<User & { pinnedNotes?: string }> => {
    const res = await api.get<User & { pinnedNotes?: string }>(`/users/${userId}`);
    return res.data;
  },

  updateNotes: async (userId: number, notes: string): Promise<void> => {
    await api.put(`/users/${userId}/notes`, { notes });
  },
};
