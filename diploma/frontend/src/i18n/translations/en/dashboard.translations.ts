import { IDashboardTranslations } from "@interfaces/i18n/frontend/index";

export const dashboard: IDashboardTranslations = {
  title: "Schedule Management",
  welcome: "Welcome, {{name}}!",
  teacherText: "Manage schedule and subjects",
  studentText: "Track your schedule and academic progress",
  menu: {
    main: "Home",
    subjects: "Subjects",
    schedule: "Schedule",
    students: "Students",
    logout: "Logout",
  },
  roles: {
    teacher: "Teacher",
    student: "Student",
  },
  errors: {
    loadStudents: "Failed to load students",
  },
};
