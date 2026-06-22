import { IScheduleViewTranslations } from "../en/schedule-view.translations";

export const scheduleView: IScheduleViewTranslations = {
  title: "Расписание занятий",
  teacherTitle: "Мои занятия",
  loading: "Загрузка расписания...",
  views: {
    week: "Неделя",
    day: "День",
    list: "Список",
  },
  navigation: {
    today: "Сегодня",
    previous: "Назад",
    next: "Вперед",
  },
  noLessons: "Нет занятий на выбранную дату",
  details: {
    title: "Детали занятия",
    activity: "Занятие",
    date: "Дата",
    time: "Время",
    teacher: "Преподаватель",
    room: "Аудитория",
    meetLink: "Ссылка на занятие",
    connect: "Подключиться",
    enrolled: "Записано учеников",
    viewStudents: "Посмотреть список учеников",
  },
  students: {
    title: "Список учеников",
    noStudents: "Нет записанных учеников",
  },
  request: {
    title: "Запрос администратору",
    label: "Текст запроса",
    placeholder: "Опишите причину запроса (минимум 10 символов)",
    send: "Отправить запрос",
    cancel: "Отмена",
    success: "Запрос отправлен администратору",
    error: "Ошибка отправки запроса",
    minLength: "Текст должен содержать минимум 10 символов",
    maxLength: "Текст не должен превышать 500 символов",
  },
  statuses: {
    planned: "Запланировано",
    in_progress: "В процессе",
    completed: "Завершено",
    cancelled: "Отменено",
  },
  meetLink: {
    available: "Есть ссылка",
    hasLink: "Есть ссылка",
  },
  table: {
    date: "Дата",
    time: "Время",
    activity: "Занятие",
    teacher: "Преподаватель",
    students: "Ученики",
    actions: "Действия",
  },
};