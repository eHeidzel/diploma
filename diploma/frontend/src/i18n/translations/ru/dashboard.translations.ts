import { IDashboardTranslations } from "@interfaces/dashboard.interface";

export const dashboard: IDashboardTranslations = {
  title: "Управление расписанием",
  welcome: "Добро пожаловать, {{name}}!",
  teacherText: "Управляйте расписанием и предметами",
  studentText: "Следите за расписанием и успеваемостью",
  noData: "Нет данных",
  registrationDate: "Дата регистрации",
  name: "Имя",
  menu: {
    main: "Главная",
    subjects: "Предметы",
    schedule: "Расписание",
    students: "Ученики",
    logout: "Выйти",
    test: "Тест",
  },
  roles: {
    teacher: "Преподаватель",
    student: "Ученик",
  },
  errors: {
    loadStudents: "Ошибка загрузки учеников",
  },
};
