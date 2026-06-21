import { IDashboardTranslations } from "@interfaces/dashboard.interface";

export const dashboard: IDashboardTranslations = {
  title: "Schedule Management",
  welcome: "Welcome, {{name}}!",
  teacherText: "Manage schedule and subjects",
  studentText: "Track your schedule and academic progress",
  noData: "No data",
  registrationDate: "Registration date",
  name: "Name",
  menu: {
    main: "Home",
    learning: "Learning",
    schedule: "Schedule",
    students: "Students",
    logout: "Logout",
    test: "Test",
  },
  roles: {
    teacher: "Teacher",
    student: "Student",
  },
  errors: {
    loadStudents: "Failed to load students",
  },
};
