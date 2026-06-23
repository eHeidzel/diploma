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
    api.post("/auth/login", { email, password }),
  register: (data: any) => api.post("/auth/register", data),
  logout: () => api.post("/auth/logout"),
  getProfile: () => api.get("/auth/profile"),
};

export const activitiesApi = {
  getAll: (lang?: string) => api.get("/activities", { params: { lang } }),
  getById: (id: number, lang?: string) =>
    api.get(`/activities/${id}`, { params: { lang } }),
  book: (activityId: number, data: any) =>
    api.post("/activities/bookings", { activityId, ...data }),
  getTeacherAvailableSlots: (
    teacherId: number,
    date: string,
    duration?: number,
  ) =>
    api.get(`/activities/teacher/${teacherId}/available-slots`, {
      params: { date, duration },
    }),
  checkTeacherAvailability: (
    teacherId: number,
    date: string,
    startTime: string,
    endTime: string,
  ) =>
    api.get(`/activities/teacher/${teacherId}/check-availability`, {
      params: { date, startTime, endTime },
    }),
  getAvailableDates: (activityId: number) =>
    api.get(`/activities/${activityId}/available-dates`),
};

export const notificationsApi = {
  getAll: () => api.get("/notifications"),
  getUnreadCount: () => api.get("/notifications/unread/count"),
  markAsRead: (id: number) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch("/notifications/read-all"),
  delete: (id: number) => api.delete(`/notifications/${id}`),
};

export const profileApi = {
  get: () => api.get("/profile"),
  update: (data: any) => api.put("/profile", data),
  changePassword: (currentPassword: string, newPassword: string) =>
    api.post("/profile/change-password", { currentPassword, newPassword }),
  uploadAvatar: (file: File) => {
    const formData = new FormData();
    formData.append("avatar", file);
    return api.post("/profile/avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  getBalance: () => api.get("/profile/balance"),
};

export const settingsApi = {
  get: () => api.get("/settings"),
  update: (data: { language?: string; notificationsEnabled?: boolean }) =>
    api.put("/settings", data),
  updateNotifications: (data: { enabled: boolean }) =>
    api.put("/settings/notifications", data),
  updatePrivacy: (data: any) => api.put("/settings/privacy", data),
};

export const balanceApi = {
  get: () => api.get("/balance"),
  topUp: (amount: number, paymentMethod: string) =>
    api.post("/balance/topup", { amount, paymentMethod }),
  getTransactions: () => api.get("/balance/transactions"),
};

export const scheduleApi = {
  getAll: () => api.get("/schedule"),
  getMy: () => api.get("/schedule/student/my"),
  getByTeacher: (teacherId: number) =>
    api.get(`/schedule/teacher/${teacherId}`),
  getByActivity: (activityId: number) =>
    api.get(`/schedule/activity/${activityId}`),
  getAvailable: (activityId: number) =>
    api.get(`/schedule/available/${activityId}`),
  enroll: (scheduleId: number) => api.post(`/schedule/enroll/${scheduleId}`),
  cancel: (scheduleId: number) => api.delete(`/schedule/cancel/${scheduleId}`),
  getEnrolledStudents: (scheduleId: number) =>
    api.get(`/schedule/${scheduleId}/students`),
  checkEnrollment: (activityId: number) =>
    api.get(`/schedule/check-enrollment/${activityId}`),
  getMySeries: () => api.get("/schedule/series/my"),
  cancelSeries: (seriesId: number) =>
    api.post(`/schedule/series/${seriesId}/cancel`),
  getSeriesById: (seriesId: number) => api.get(`/schedule/series/${seriesId}`),
  getSchedulesBySeries: (seriesId: number) =>
    api.get(`/schedule/series/${seriesId}/schedules`),
  sendRequest: (data: {
    scheduleId: number;
    requestType: string;
    reason: string;
    proposedDate?: string;
    proposedTime?: string;
  }) => api.post("/schedule-requests", data),
};

export const teacherApi = {
  getWorkload: (startDate: string, endDate: string) =>
    api.get("/teacher/workload", { params: { startDate, endDate } }),
  getStudents: () => api.get("/teacher/students"),
  getStudentProfile: (studentId: number) =>
    api.get(`/teacher/students/${studentId}`),
  getGroups: () => api.get("/teacher/groups"),
  getStats: () => api.get("/teacher/stats"),
  getAvailableSlots: (teacherId: number, date: string, duration?: number) =>
    api.get(`/teacher/${teacherId}/available-slots`, {
      params: { date, duration },
    }),
  getAvailableDates: (teacherId: number, startDate: string, endDate: string) =>
    api.get(`/teacher/${teacherId}/available-dates`, {
      params: { startDate, endDate },
    }),
};

export const materialsApi = {
  getAll: () => api.get("/materials"),
  getById: (id: number) => api.get(`/materials/${id}`),
  getByCategory: (category: string) =>
    api.get(`/materials/category/${category}`),
};

export const schoolReviewsApi = {
  getAll: () => api.get("/reviews"),
  getOne: (id: number) => api.get(`/reviews/${id}`),
  getMy: () => api.get("/reviews/my"),
  create: (data: { rating: number; text: string }) =>
    api.post("/reviews", data),
  update: (id: number, data: { rating: number; text: string }) =>
    api.put(`/reviews/${id}`, data),
  delete: (id: number) => api.delete(`/reviews/${id}`),
};

export const reviewsApi = {
  getByActivity: (activityId: number) =>
    api.get(`/activities/${activityId}/reviews`),
  getMy: (activityId: number) =>
    api.get(`/activities/${activityId}/reviews/my`),
  create: (activityId: number, data: { rating: number; text: string }) =>
    api.post(`/activities/${activityId}/reviews`, data),
  update: (
    activityId: number,
    reviewId: number,
    data: { rating: number; text: string },
  ) => api.put(`/activities/${activityId}/reviews/${reviewId}`, data),
  delete: (activityId: number, reviewId: number) =>
    api.delete(`/activities/${activityId}/reviews/${reviewId}`),
};

export const scheduleRequestsApi = {
  getAll: () => api.get("/schedule-requests"),
  getPending: () => api.get("/schedule-requests/pending"),
  getByUser: (userId: number) => api.get(`/schedule-requests/user/${userId}`),
  getMy: () => api.get("/schedule-requests/my"),
  create: (data: { reason: string }) => api.post("/schedule-requests", data),
  approve: (id: number) => api.patch(`/schedule-requests/${id}/approve`),
  reject: (id: number) => api.patch(`/schedule-requests/${id}/reject`),
  delete: (id: number) => api.delete(`/schedule-requests/${id}`),
};

export const adminApi = {
  getUsers: () => api.get("/admin/users"),
  getTeachers: () => api.get("/admin/users/teachers"),
  createTeacher: (data: any) => api.post("/admin/users/teacher", data),
  updateUser: (id: number, data: any) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id: number) => api.delete(`/admin/users/${id}`),
  blockUser: (id: number, isBlocked: boolean, reason?: string, until?: string) =>
    api.patch(`/admin/users/${id}/block`, { isBlocked, reason, until }),
  getBlacklist: () => api.get("/admin/blacklist"),
  getTeacherRequests: () => api.get("/admin/teacher-requests"),
  processTeacherRequest: (id: number, status: string) =>
    api.patch(`/admin/teacher-requests/${id}`, { status }),
  getSchedule: () => api.get("/admin/schedule"),
  createSchedule: (data: any) => api.post("/admin/schedule", data),
  updateSchedule: (id: number, data: any) =>
    api.put(`/admin/schedule/${id}`, data),
  deleteSchedule: (id: number) => api.delete(`/admin/schedule/${id}`),
  getTeacherAccesses: () => api.get("/admin/access"),
  grantTeacherAccess: (data: { teacherId: number; category: string; googleDriveLink: string }) =>
    api.post("/admin/access", data),
  revokeTeacherAccess: (id: number) => api.delete(`/admin/access/${id}`),
  getActivities: () => api.get("/admin/activities"),
  createActivity: (data: any) => api.post("/admin/activities", data),
  updateActivity: (id: number, data: any) =>
    api.put(`/admin/activities/${id}`, data),
  deleteActivity: (id: number) => api.delete(`/admin/activities/${id}`),
};

export const dashboardApi = {
  getReviews: () => api.get("/reviews"),
  getTeachers: () => api.get("/teachers"),
  getProjects: () => api.get("/projects"),
  getStatistics: () => api.get("/statistics"),
};

export default api;
