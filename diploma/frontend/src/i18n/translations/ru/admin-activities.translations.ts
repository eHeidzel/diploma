export interface IAdminActivitiesTranslations {
  title: string;
  createButton: string;
  editButton: string;
  deleteButton: string;
  createTitle: string;
  editTitle: string;
  fields: {
    title: string;
    type: string;
    categories: string;
    description: string;
    teacher: string;
    price: string;
    duration: string;
    ageRange: string;
    level: string;
    groupPeriod: string;
    groupShift: string;
    meetLink: string;
    meetLinkPlaceholder: string;
    meetLinkExtra: string;
    isActive: string;
    learningPlan: string;
    planTitle: string;
    planDuration: string;
    planDescription: string;
  };
  placeholders: {
    title: string;
    description: string;
    price: string;
    meetLink: string;
    planTitle: string;
    planDuration: string;
    planDescription: string;
  };
  validation: {
    titleRequired: string;
    typeRequired: string;
    categoriesRequired: string;
    descriptionRequired: string;
    teacherRequired: string;
    priceRequired: string;
    priceMin: string;
    durationRequired: string;
    ageRangeRequired: string;
    levelRequired: string;
    groupPeriodRequired: string;
    groupShiftRequired: string;
  };
  messages: {
    createSuccess: string;
    updateSuccess: string;
    deleteSuccess: string;
    deleteConfirm: string;
    deleteConfirmTitle: string;
    loadError: string;
    saveError: string;
    deleteError: string;
    noDates: string;
    addDate: string;
    selectDate: string;
    selectTime: string;
    dateInfo: string;
    dateInfoIndividual: string;
    dateInfoTrial: string;
    addDateButton: string;
    removeDate: string;
    learningPlanInfo: string;
    learningPlanRequired: string;
    addLearningPlanItem: string;
  };
  table: {
    id: string;
    title: string;
    type: string;
    categories: string;
    price: string;
    teacher: string;
    duration: string;
    meetLink: string;
    isActive: string;
    actions: string;
    active: string;
    inactive: string;
    notSpecified: string;
    openLink: string;
    free: string;
    notAssigned: string;
  };
  types: {
    webinar: string;
    masterclass: string;
    individual: string;
    group: string;
    trial: string;
  };
  durationOptions: {
    "30 мин": string;
    "45 мин": string;
    "1 час": string;
    "1.5 часа": string;
    "2 часа": string;
    "2.5 часа": string;
    "3 часа": string;
  };
  ageRanges: {
    "8-12": string;
    "13-17": string;
    "18-25": string;
    "25-35": string;
    "35+": string;
    all: string;
  };
  levels: {
    beginner: string;
    intermediate: string;
    advanced: string;
    all: string;
  };
  groupPeriods: {
    "6 месяцев": string;
    год: string;
  };
  groupShifts: {
    утренняя: string;
    дневная: string;
    вечерняя: string;
  };
}

export const adminActivities: IAdminActivitiesTranslations = {
  title: "Управление активностями",
  createButton: "Создать активность",
  editButton: "Редактировать",
  deleteButton: "Удалить",
  createTitle: "Создание активности",
  editTitle: "Редактирование активности",
  fields: {
    title: "Название",
    type: "Тип активности",
    categories: "Категории",
    description: "Описание",
    teacher: "Преподаватель",
    price: "Цена (BYN)",
    duration: "Длительность",
    ageRange: "Возрастная группа",
    level: "Уровень",
    groupPeriod: "Период",
    groupShift: "Смена",
    meetLink: "Ссылка на конференцию (опционально)",
    meetLinkPlaceholder: "https://meet.google.com/xxx-xxxx-xxx",
    meetLinkExtra: "Общая ссылка для всех занятий этой активности",
    isActive: "Активно",
    learningPlan: "Программа обучения",
    planTitle: "Тема",
    planDuration: "Длительность",
    planDescription: "Описание",
  },
  placeholders: {
    title: "Введите название активности",
    description: "Введите описание",
    price: "0 - бесплатно",
    meetLink: "https://meet.google.com/xxx-xxxx-xxx",
    planTitle: "Введите название темы",
    planDuration: "Выберите длительность",
    planDescription: "Введите описание",
  },
  validation: {
    titleRequired: "Пожалуйста, введите название",
    typeRequired: "Пожалуйста, выберите тип",
    categoriesRequired: "Пожалуйста, выберите категории",
    descriptionRequired: "Пожалуйста, введите описание",
    teacherRequired: "Пожалуйста, выберите преподавателя",
    priceRequired: "Пожалуйста, введите цену",
    priceMin: "Цена не может быть отрицательной",
    durationRequired: "Пожалуйста, выберите длительность",
    ageRangeRequired: "Пожалуйста, выберите возрастную группу",
    levelRequired: "Пожалуйста, выберите уровень",
    groupPeriodRequired: "Пожалуйста, выберите период",
    groupShiftRequired: "Пожалуйста, выберите смену",
  },
  messages: {
    createSuccess: "Активность успешно создана",
    updateSuccess: "Активность успешно обновлена",
    deleteSuccess: "Активность успешно удалена",
    deleteConfirm: "Вы уверены, что хотите удалить эту активность?",
    deleteConfirmTitle: "Удаление активности",
    loadError: "Не удалось загрузить активности",
    saveError: "Не удалось сохранить активность",
    deleteError: "Не удалось удалить активность",
    noDates: "Добавьте даты для активности",
    addDate: "Для этого типа активности необходимо указать конкретные даты и время",
    selectDate: "Выберите дату",
    selectTime: "Выберите время",
    dateInfo: "Пользователь выберет дни недели, система проверит доступность преподавателя с 8:00 до 20:00",
    dateInfoIndividual: "Пользователь выберет дни недели, система проверит доступность преподавателя с 8:00 до 20:00",
    dateInfoTrial: "Пользователь выберет дату, система проверит доступность преподавателя с 8:00 до 20:00",
    addDateButton: "Добавить дату",
    removeDate: "Удалить",
    learningPlanInfo: "Введите программу обучения для группового курса. Каждая тема должна иметь название, длительность и описание.",
    learningPlanRequired: "Пожалуйста, добавьте хотя бы одну тему в программу обучения",
    addLearningPlanItem: "Добавить тему",
  },
  table: {
    id: "ID",
    title: "Название",
    type: "Тип",
    categories: "Категории",
    price: "Цена",
    teacher: "Преподаватель",
    duration: "Длительность",
    meetLink: "Ссылка на конференцию",
    isActive: "Активно",
    actions: "Действия",
    active: "Да",
    inactive: "Нет",
    notSpecified: "Не указано",
    openLink: "Открыть",
    free: "Бесплатно",
    notAssigned: "Не назначен",
  },
  types: {
    webinar: "Вебинар",
    masterclass: "Мастер-класс",
    individual: "Индивидуальное",
    group: "Групповое",
    trial: "Пробное",
  },
  durationOptions: {
    "30 мин": "30 минут",
    "45 мин": "45 минут (академический час)",
    "1 час": "1 час (астрономический час)",
    "1.5 часа": "1.5 часа",
    "2 часа": "2 часа",
    "2.5 часа": "2.5 часа",
    "3 часа": "3 часа",
  },
  ageRanges: {
    "8-12": "8-12 лет",
    "13-17": "13-17 лет",
    "18-25": "18-25 лет",
    "25-35": "25-35 лет",
    "35+": "35+ лет",
    all: "Все возрасты",
  },
  levels: {
    beginner: "Начинающий",
    intermediate: "Средний",
    advanced: "Продвинутый",
    all: "Любой уровень",
  },
  groupPeriods: {
    "6 месяцев": "6 месяцев",
    год: "1 год",
  },
  groupShifts: {
    утренняя: "Утренняя",
    дневная: "Дневная",
    вечерняя: "Вечерняя",
  },
};