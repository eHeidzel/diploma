import axios from "axios";

const api = axios.create({
  baseURL: "https://codezone1.vercel.app",
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

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isGuest = localStorage.getItem("isGuest") === "true";

    if (error.response?.status === 401 && isGuest) {
      console.warn("Guest: Ignoring 401 error");
      return Promise.resolve({
        data: [],
        status: 200,
        statusText: "OK",
        headers: {},
        config: error.config,
      });
    }

    if (error.response?.status === 401) {
      const message = error.response?.data?.message || "";

      if (
        message.toLowerCase().includes("заблокирован") ||
        message.toLowerCase().includes("blocked")
      ) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login?blocked=true";
      } else {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

export const authApi = {
  login: (email: string, password: string) =>
    api.post("/api/auth/login", { email, password }),
  register: (data: any) => api.post("/api/auth/register", data),
  logout: () => api.post("/api/auth/logout"),
  getProfile: () => api.get("/api/auth/profile"),
};

export const activitiesApi = {
  getAll: (lang?: string) => api.get("/api/activities", { params: { lang } }),
  getById: (id: number, lang?: string) =>
    api.get(`/api/activities/${id}`, { params: { lang } }),
  book: (activityId: number, data: any) =>
    api.post("/api/activities/bookings", { activityId, ...data }),
  getTeacherAvailableSlots: (
    teacherId: number,
    date: string,
    duration?: number,
  ) =>
    api.get(`/api/activities/teacher/${teacherId}/available-slots`, {
      params: { date, duration },
    }),
  checkTeacherAvailability: (
    teacherId: number,
    date: string,
    startTime: string,
    endTime: string,
  ) =>
    api.get(`/api/activities/teacher/${teacherId}/check-availability`, {
      params: { date, startTime, endTime },
    }),
  getAvailableDates: (activityId: number) =>
    api.get(`/api/activities/${activityId}/available-dates`),
};

export const notificationsApi = {
  getAll: () => api.get("/api/notifications"),
  getUnreadCount: () => api.get("/api/notifications/unread/count"),
  markAsRead: (id: number) => api.patch(`/api/notifications/${id}/read`),
  markAllAsRead: () => api.patch("/api/notifications/read-all"),
  delete: (id: number) => api.delete(`/api/notifications/${id}`),
};

export const profileApi = {
  get: () => api.get("/api/profile"),
  update: (data: any) => api.put("/api/profile", data),
  changePassword: (currentPassword: string, newPassword: string) =>
    api.post("/api/profile/change-password", { currentPassword, newPassword }),
  uploadAvatar: (file: File) => {
    const formData = new FormData();
    formData.append("avatar", file);
    return api.post("/api/profile/avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  getBalance: () => api.get("/api/profile/balance"),
};

export const settingsApi = {
  get: () => api.get("/api/settings"),
  update: (data: { language?: string; notificationsEnabled?: boolean }) =>
    api.put("/api/settings", data),
  updateNotifications: (data: { enabled: boolean }) =>
    api.put("/api/settings/notifications", data),
  updatePrivacy: (data: any) => api.put("/api/settings/privacy", data),
};

export const balanceApi = {
  get: () => api.get("/api/balance"),
  topUp: (amount: number, paymentMethod: string) =>
    api.post("/api/balance/topup", { amount, paymentMethod }),
  getTransactions: () => api.get("/api/balance/transactions"),
};

export const scheduleApi = {
  getAll: () => api.get("/api/schedule"),
  getMy: () => api.get("/api/schedule/student/my"),
  getByTeacher: (teacherId: number) =>
    api.get(`/api/schedule/teacher/${teacherId}`),
  getByActivity: (activityId: number) =>
    api.get(`/api/schedule/activity/${activityId}`),
  getAvailable: (activityId: number) =>
    api.get(`/api/schedule/available/${activityId}`),
  enroll: (scheduleId: number) => api.post(`/api/schedule/enroll/${scheduleId}`),
  cancel: (scheduleId: number) => api.delete(`/api/schedule/cancel/${scheduleId}`),
  getEnrolledStudents: (scheduleId: number) =>
    api.get(`/api/schedule/${scheduleId}/students`),
  checkEnrollment: (activityId: number) =>
    api.get(`/api/schedule/check-enrollment/${activityId}`),
  getMySeries: () => api.get("/api/schedule/series/my"),
  cancelSeries: (seriesId: number) =>
    api.post(`/api/schedule/series/${seriesId}/cancel`),
  getSeriesById: (seriesId: number) => api.get(`/api/schedule/series/${seriesId}`),
  getSchedulesBySeries: (seriesId: number) =>
    api.get(`/api/schedule/series/${seriesId}/schedules`),
  sendRequest: (data: {
    scheduleId: number;
    requestType: string;
    reason: string;
    proposedDate?: string;
    proposedTime?: string;
  }) => api.post("/api/schedule-requests", data),
};

export const teacherApi = {
  getWorkload: (startDate: string, endDate: string) =>
    api.get("/api/teacher/workload", { params: { startDate, endDate } }),
  getStudents: () => api.get("/api/teacher/students"),
  getStudentProfile: (studentId: number) =>
    api.get(`/api/teacher/students/${studentId}`),
  getGroups: () => api.get("/api/teacher/groups"),
  getStats: () => api.get("/api/teacher/stats"),
  getAvailableSlots: (teacherId: number, date: string, duration?: number) =>
    api.get(`/api/teacher/${teacherId}/available-slots`, {
      params: { date, duration },
    }),
  getAvailableDates: (teacherId: number, startDate: string, endDate: string) =>
    api.get(`/api/teacher/${teacherId}/available-dates`, {
      params: { startDate, endDate },
    }),
};

export const materialsApi = {
  getAll: () => api.get("/api/materials"),
  getById: (id: number) => api.get(`/api/materials/${id}`),
  getByCategory: (category: string) =>
    api.get(`/api/materials/category/${category}`),
};

export const schoolReviewsApi = {
  getAll: () => api.get("/api/reviews"),
  getOne: (id: number) => api.get(`/api/reviews/${id}`),
  getMy: () => api.get("/api/reviews/my"),
  create: (data: { rating: number; text: string }) =>
    api.post("/api/reviews", data),
  update: (id: number, data: { rating: number; text: string }) =>
    api.put(`/api/reviews/${id}`, data),
  delete: (id: number) => api.delete(`/api/reviews/${id}`),
};

export const reviewsApi = {
  getByActivity: (activityId: number) =>
    api.get(`/api/activities/${activityId}/reviews`),
  getMy: (activityId: number) =>
    api.get(`/api/activities/${activityId}/reviews/my`),
  create: (activityId: number, data: { rating: number; text: string }) =>
    api.post(`/api/activities/${activityId}/reviews`, data),
  update: (
    activityId: number,
    reviewId: number,
    data: { rating: number; text: string },
  ) => api.put(`/api/activities/${activityId}/reviews/${reviewId}`, data),
  delete: (activityId: number, reviewId: number) =>
    api.delete(`/api/activities/${activityId}/reviews/${reviewId}`),
};

export const scheduleRequestsApi = {
  getAll: () => api.get("/api/schedule-requests"),
  getPending: () => api.get("/api/schedule-requests/pending"),
  getByUser: (userId: number) => api.get(`/api/schedule-requests/user/${userId}`),
  getMy: () => api.get("/api/schedule-requests/my"),
  create: (data: { reason: string }) => api.post("/api/schedule-requests", data),
  approve: (id: number) => api.patch(`/api/schedule-requests/${id}/approve`),
  reject: (id: number) => api.patch(`/api/schedule-requests/${id}/reject`),
  delete: (id: number) => api.delete(`/api/schedule-requests/${id}`),
};

export const adminApi = {
  getUsers: () => api.get("/api/admin/users"),
  getTeachers: () => api.get("/api/admin/users/teachers"),
  createTeacher: (data: any) => api.post("/api/admin/users/teacher", data),
  updateUser: (id: number, data: any) => api.put(`/api/admin/users/${id}`, data),
  deleteUser: (id: number) => api.delete(`/api/admin/users/${id}`),
  blockUser: (id: number, isBlocked: boolean, reason?: string, until?: string) =>
    api.patch(`/api/admin/users/${id}/block`, { isBlocked, reason, until }),
  getBlacklist: () => api.get("/api/admin/blacklist"),
  getTeacherRequests: () => api.get("/api/admin/teacher-requests"),
  processTeacherRequest: (id: number, status: string) =>
    api.patch(`/api/admin/teacher-requests/${id}`, { status }),
  getSchedule: () => api.get("/api/admin/schedule"),
  createSchedule: (data: any) => api.post("/api/admin/schedule", data),
  updateSchedule: (id: number, data: any) =>
    api.put(`/api/admin/schedule/${id}`, data),
  deleteSchedule: (id: number) => api.delete(`/api/admin/schedule/${id}`),
  getTeacherAccesses: () => api.get("/api/admin/access"),
  grantTeacherAccess: (data: { teacherId: number; category: string; googleDriveLink: string }) =>
    api.post("/api/admin/access", data),
  revokeTeacherAccess: (id: number) => api.delete(`/api/admin/access/${id}`),
  getActivities: () => api.get("/api/admin/activities"),
  createActivity: (data: any) => api.post("/api/admin/activities", data),
  updateActivity: (id: number, data: any) =>
    api.put(`/api/admin/activities/${id}`, data),
  deleteActivity: (id: number) => api.delete(`/api/admin/activities/${id}`),
};

export const dashboardApi = {
  getReviews: () => api.get("/api/reviews"),
  getTeachers: () => api.get("/api/teachers"),
  getProjects: () => api.get("/api/projects"),
  getStatistics: () => api.get("/api/statistics"),
};

export default api;