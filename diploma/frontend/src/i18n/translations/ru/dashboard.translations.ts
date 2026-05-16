import { IDashboardTranslations } from "@interfaces/i18n/frontend/index";

export const dashboard: IDashboardTranslations = {
  title: "Управление расписанием",
  welcome: "Добро пожаловать, {{name}}!",
  teacherText: "Управляйте расписанием и предметами",
  studentText: "Следите за расписанием и успеваемостью",
  menu: {
    main: "Главная",
    subjects: "Предметы",
    schedule: "Расписание",
    students: "Ученики",
    logout: "Выйти",
  },
  roles: {
    teacher: "Преподаватель",
    student: "Ученик",
  },
  errors: {
    loadStudents: "Ошибка загрузки учеников",
  },
};
