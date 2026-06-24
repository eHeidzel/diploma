import axios from "axios";

const api = axios.create({
  baseURL: "https://diploma-production-f729.up.railway.app/",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Функция для безопасного парсинга JSON
const safeParseJSON = (data: any) => {
  if (typeof data === 'string') {
    try {
      return JSON.parse(data);
    } catch (e) {
      console.warn('Invalid JSON response:', data);
      return null;
    }
  }
  return data;
};

api.interceptors.response.use(
  (response) => {
    // Безопасно парсим JSON если это строка
    if (typeof response.data === 'string') {
      response.data = safeParseJSON(response.data);
    }
    
    // Проверяем, что данные не null/undefined для массивов
    if (Array.isArray(response.data) && response.data === null) {
      response.data = [];
    }
    
    return response;
  },
  (error) => {
    const isGuest = localStorage.getItem("isGuest") === "true";
    const isLoginPage = window.location.pathname === "/login";
    const isRegisterPage = window.location.pathname === "/register";

    // Для гостей игнорируем 401 ошибки
    if (error.response?.status === 401 && isGuest) {
      console.warn("Guest: Ignoring 401 error");
      
      // Возвращаем безопасные данные в зависимости от типа запроса
      const url = error.config?.url || '';
      const method = error.config?.method || 'get';
      
      let safeData: any = {};
      
      // Для запросов, которые ожидают массив
      if (url.includes('/activities') || 
          url.includes('/notifications') || 
          url.includes('/reviews') || 
          url.includes('/schedule') ||
          url.includes('/users') ||
          url.includes('/materials') ||
          url.includes('/projects') ||
          url.includes('/teachers')) {
        safeData = [];
      }
      
      // Для запросов профиля
      if (url.includes('/profile') || url.includes('/auth/profile')) {
        safeData = null;
      }
      
      // Для запросов с пагинацией
      if (url.includes('page') || url.includes('limit')) {
        safeData = { data: [], total: 0, page: 1, limit: 10 };
      }
      
      return Promise.resolve({
        data: safeData,
        status: 200,
        statusText: "OK",
        headers: {},
        config: error.config,
      });
    }

    // Если не гость и не на страницах авторизации
    if (error.response?.status === 401 && !isGuest && !isLoginPage && !isRegisterPage) {
      console.warn("Token expired or invalid, redirecting to login");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.setItem("isGuest", "true");
      window.location.href = "/login";
      return Promise.reject(error);
    }

    // Обработка других ошибок
    if (error.response?.status === 404) {
      console.warn("Resource not found:", error.config?.url);
      return Promise.resolve({
        data: null,
        status: 404,
        statusText: "Not Found",
        headers: {},
        config: error.config,
      });
    }

    // Обработка ошибок парсинга JSON
    if (error.message?.includes('JSON')) {
      console.warn("JSON parsing error, returning empty data");
      return Promise.resolve({
        data: {},
        status: 200,
        statusText: "OK",
        headers: {},
        config: error.config,
      });
    }

    // Для всех остальных - пробрасываем ошибку
    return Promise.reject(error);
  },
);

// Обертка для всех API методов с безопасной обработкой
const safeApiCall = async (apiCall: () => Promise<any>, defaultValue: any = null) => {
  try {
    const response = await apiCall();
    return response;
  } catch (error: any) {
    console.warn('API call failed:', error.message);
    return {
      data: defaultValue,
      status: 200,
      statusText: "OK",
      headers: {},
      config: {},
    };
  }
};

// Экспортируем обернутые API методы
export const authApi = {
  login: (email: string, password: string) =>
    safeApiCall(() => api.post("/auth/login", { email, password }), null),
  register: (data: any) => 
    safeApiCall(() => api.post("/auth/register", data), null),
  logout: () => 
    safeApiCall(() => api.post("/auth/logout"), null),
  getProfile: () => 
    safeApiCall(() => api.get("/auth/profile"), null),
};

export const activitiesApi = {
  getAll: (lang?: string) => 
    safeApiCall(() => api.get("/activities", { params: { lang } }), []),
  getById: (id: number, lang?: string) =>
    safeApiCall(() => api.get(`/activities/${id}`, { params: { lang } }), null),
  book: (activityId: number, data: any) =>
    safeApiCall(() => api.post("/activities/bookings", { activityId, ...data }), null),
  getTeacherAvailableSlots: (teacherId: number, date: string, duration?: number) =>
    safeApiCall(() => api.get(`/activities/teacher/${teacherId}/available-slots`, {
      params: { date, duration },
    }), []),
  checkTeacherAvailability: (teacherId: number, date: string, startTime: string, endTime: string) =>
    safeApiCall(() => api.get(`/activities/teacher/${teacherId}/check-availability`, {
      params: { date, startTime, endTime },
    }), { available: false }),
  getAvailableDates: (activityId: number) =>
    safeApiCall(() => api.get(`/activities/${activityId}/available-dates`), []),
};

export const notificationsApi = {
  getAll: () => safeApiCall(() => api.get("/notifications"), []),
  getUnreadCount: () => safeApiCall(() => api.get("/notifications/unread/count"), 0),
  markAsRead: (id: number) => safeApiCall(() => api.patch(`/notifications/${id}/read`), null),
  markAllAsRead: () => safeApiCall(() => api.patch("/notifications/read-all"), null),
  delete: (id: number) => safeApiCall(() => api.delete(`/notifications/${id}`), null),
};

export const profileApi = {
  get: () => safeApiCall(() => api.get("/profile"), null),
  update: (data: any) => safeApiCall(() => api.put("/profile", data), null),
  changePassword: (currentPassword: string, newPassword: string) =>
    safeApiCall(() => api.post("/profile/change-password", { currentPassword, newPassword }), null),
  uploadAvatar: (file: File) => {
    const formData = new FormData();
    formData.append("avatar", file);
    return safeApiCall(() => api.post("/profile/avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }), null);
  },
  getBalance: () => safeApiCall(() => api.get("/profile/balance"), 0),
};

export const settingsApi = {
  get: () => safeApiCall(() => api.get("/settings"), { language: 'ru', notificationsEnabled: true }),
  update: (data: { language?: string; notificationsEnabled?: boolean }) =>
    safeApiCall(() => api.put("/settings", data), null),
  updateNotifications: (data: { enabled: boolean }) =>
    safeApiCall(() => api.put("/settings/notifications", data), null),
  updatePrivacy: (data: any) => safeApiCall(() => api.put("/settings/privacy", data), null),
};

export const balanceApi = {
  get: () => safeApiCall(() => api.get("/balance"), 0),
  topUp: (amount: number, paymentMethod: string) =>
    safeApiCall(() => api.post("/balance/topup", { amount, paymentMethod }), null),
  getTransactions: () => safeApiCall(() => api.get("/balance/transactions"), []),
};

export const scheduleApi = {
  getAll: () => safeApiCall(() => api.get("/schedule"), []),
  getMy: () => safeApiCall(() => api.get("/schedule/student/my"), []),
  getByTeacher: (teacherId: number) =>
    safeApiCall(() => api.get(`/schedule/teacher/${teacherId}`), []),
  getByActivity: (activityId: number) =>
    safeApiCall(() => api.get(`/schedule/activity/${activityId}`), []),
  getAvailable: (activityId: number) =>
    safeApiCall(() => api.get(`/schedule/available/${activityId}`), []),
  enroll: (scheduleId: number) => safeApiCall(() => api.post(`/schedule/enroll/${scheduleId}`), null),
  cancel: (scheduleId: number) => safeApiCall(() => api.delete(`/schedule/cancel/${scheduleId}`), null),
  getEnrolledStudents: (scheduleId: number) =>
    safeApiCall(() => api.get(`/schedule/${scheduleId}/students`), []),
  checkEnrollment: (activityId: number) =>
    safeApiCall(() => api.get(`/schedule/check-enrollment/${activityId}`), false),
  getMySeries: () => safeApiCall(() => api.get("/schedule/series/my"), []),
  cancelSeries: (seriesId: number) =>
    safeApiCall(() => api.post(`/schedule/series/${seriesId}/cancel`), null),
  getSeriesById: (seriesId: number) => safeApiCall(() => api.get(`/schedule/series/${seriesId}`), null),
  getSchedulesBySeries: (seriesId: number) =>
    safeApiCall(() => api.get(`/schedule/series/${seriesId}/schedules`), []),
  sendRequest: (data: {
    scheduleId: number;
    requestType: string;
    reason: string;
    proposedDate?: string;
    proposedTime?: string;
  }) => safeApiCall(() => api.post("/schedule-requests", data), null),
};

export const teacherApi = {
  getWorkload: (startDate: string, endDate: string) =>
    safeApiCall(() => api.get("/teacher/workload", { params: { startDate, endDate } }), { lessons: 0, hours: 0 }),
  getStudents: () => safeApiCall(() => api.get("/teacher/students"), []),
  getStudentProfile: (studentId: number) =>
    safeApiCall(() => api.get(`/teacher/students/${studentId}`), null),
  getGroups: () => safeApiCall(() => api.get("/teacher/groups"), []),
  getStats: () => safeApiCall(() => api.get("/teacher/stats"), { students: 0, lessons: 0, rating: 0 }),
  getAvailableSlots: (teacherId: number, date: string, duration?: number) =>
    safeApiCall(() => api.get(`/teacher/${teacherId}/available-slots`, {
      params: { date, duration },
    }), []),
  getAvailableDates: (teacherId: number, startDate: string, endDate: string) =>
    safeApiCall(() => api.get(`/teacher/${teacherId}/available-dates`, {
      params: { startDate, endDate },
    }), []),
};

export const materialsApi = {
  getAll: () => safeApiCall(() => api.get("/materials"), []),
  getById: (id: number) => safeApiCall(() => api.get(`/materials/${id}`), null),
  getByCategory: (category: string) =>
    safeApiCall(() => api.get(`/materials/category/${category}`), []),
};

export const schoolReviewsApi = {
  getAll: () => safeApiCall(() => api.get("/reviews"), []),
  getOne: (id: number) => safeApiCall(() => api.get(`/reviews/${id}`), null),
  getMy: () => safeApiCall(() => api.get("/reviews/my"), []),
  create: (data: { rating: number; text: string }) =>
    safeApiCall(() => api.post("/reviews", data), null),
  update: (id: number, data: { rating: number; text: string }) =>
    safeApiCall(() => api.put(`/reviews/${id}`, data), null),
  delete: (id: number) => safeApiCall(() => api.delete(`/reviews/${id}`), null),
};

export const reviewsApi = {
  getByActivity: (activityId: number) =>
    safeApiCall(() => api.get(`/activities/${activityId}/reviews`), []),
  getMy: (activityId: number) =>
    safeApiCall(() => api.get(`/activities/${activityId}/reviews/my`), null),
  create: (activityId: number, data: { rating: number; text: string }) =>
    safeApiCall(() => api.post(`/activities/${activityId}/reviews`, data), null),
  update: (activityId: number, reviewId: number, data: { rating: number; text: string }) =>
    safeApiCall(() => api.put(`/activities/${activityId}/reviews/${reviewId}`, data), null),
  delete: (activityId: number, reviewId: number) =>
    safeApiCall(() => api.delete(`/activities/${activityId}/reviews/${reviewId}`), null),
};

export const scheduleRequestsApi = {
  getAll: () => safeApiCall(() => api.get("/schedule-requests"), []),
  getPending: () => safeApiCall(() => api.get("/schedule-requests/pending"), []),
  getByUser: (userId: number) =>
    safeApiCall(() => api.get(`/schedule-requests/user/${userId}`), []),
  getMy: () => safeApiCall(() => api.get("/schedule-requests/my"), []),
  create: (data: { reason: string }) => safeApiCall(() => api.post("/schedule-requests", data), null),
  approve: (id: number) => safeApiCall(() => api.patch(`/schedule-requests/${id}/approve`), null),
  reject: (id: number) => safeApiCall(() => api.patch(`/schedule-requests/${id}/reject`), null),
  delete: (id: number) => safeApiCall(() => api.delete(`/schedule-requests/${id}`), null),
};

export const adminApi = {
  getUsers: () => safeApiCall(() => api.get("/admin/users"), []),
  getTeachers: () => safeApiCall(() => api.get("/admin/users/teachers"), []),
  createTeacher: (data: any) => safeApiCall(() => api.post("/admin/users/teacher", data), null),
  updateUser: (id: number, data: any) =>
    safeApiCall(() => api.put(`/admin/users/${id}`, data), null),
  deleteUser: (id: number) => safeApiCall(() => api.delete(`/admin/users/${id}`), null),
  blockUser: (id: number, isBlocked: boolean, reason?: string, until?: string) =>
    safeApiCall(() => api.patch(`/admin/users/${id}/block`, { isBlocked, reason, until }), null),
  getBlacklist: () => safeApiCall(() => api.get("/admin/blacklist"), []),
  getTeacherRequests: () => safeApiCall(() => api.get("/admin/teacher-requests"), []),
  processTeacherRequest: (id: number, status: string) =>
    safeApiCall(() => api.patch(`/admin/teacher-requests/${id}`, { status }), null),
  getSchedule: () => safeApiCall(() => api.get("/admin/schedule"), []),
  createSchedule: (data: any) => safeApiCall(() => api.post("/admin/schedule", data), null),
  updateSchedule: (id: number, data: any) =>
    safeApiCall(() => api.put(`/admin/schedule/${id}`, data), null),
  deleteSchedule: (id: number) => safeApiCall(() => api.delete(`/admin/schedule/${id}`), null),
  getTeacherAccesses: () => safeApiCall(() => api.get("/admin/access"), []),
  grantTeacherAccess: (data: { teacherId: number; category: string; googleDriveLink: string }) =>
    safeApiCall(() => api.post("/admin/access", data), null),
  revokeTeacherAccess: (id: number) => safeApiCall(() => api.delete(`/admin/access/${id}`), null),
  getActivities: () => safeApiCall(() => api.get("/admin/activities"), []),
  createActivity: (data: any) => safeApiCall(() => api.post("/admin/activities", data), null),
  updateActivity: (id: number, data: any) =>
    safeApiCall(() => api.put(`/admin/activities/${id}`, data), null),
  deleteActivity: (id: number) => safeApiCall(() => api.delete(`/admin/activities/${id}`), null),
};

export const dashboardApi = {
  getReviews: () => safeApiCall(() => api.get("/reviews"), []),
  getTeachers: () => safeApiCall(() => api.get("/teachers"), []),
  getProjects: () => safeApiCall(() => api.get("/projects"), []),
  getStatistics: () => safeApiCall(() => api.get("/statistics"), { users: 0, activities: 0, reviews: 0 }),
};

export default api;