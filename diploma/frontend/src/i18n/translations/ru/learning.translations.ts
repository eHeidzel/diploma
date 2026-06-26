export interface ILearningTranslations {
  title: string;
  subtitle: string;
  searchPlaceholder: string;
  loading: string;
  noActivities: string;
  filters: {
    all: string;
    categories: string;
    showFree: string;
    sortBy: string;
    popularity: string;
    rating: string;
    price: string;
    sortOrder: string;
    asc: string;
    desc: string;
    clearFilters: string;
  };
  booking: {
    title: string;
    selectDate: string;
    selectTime: string;
    bookButton: string;
    cancelButton: string;
    success: string;
    error: string;
    priceInfo: string;
    free: string;
    individualInfo: string;
    groupInfo: string;
    trialInfo: string;
    webinarInfo: string;
    masterclassInfo: string;
  };
  guestModal: {
    title: string;
    content: string;
    register: string;
    cancel: string;
  };
  balanceModal: {
    insufficientFunds: string;
    topUp: string;
    cancel: string;
  };
  reviews: {
    title: string;
    writeReview: string;
    rating: string;
    comment: string;
    submit: string;
    cancel: string;
    success: string;
    error: string;
    noReviews: string;
  };
  groupBooking: {
    title: string;
    description: string;
    noAvailableGroups: string;
    noAvailableGroupsDescription: string;
    selectStartDate: string;
    selectTime: string;
    selectedTime: string;
    shiftMorning: string;
    shiftDay: string;
    shiftEvening: string;
    period: string;
    selectPeriod: string;
    sixMonths: string;
    oneYear: string;
    shift: string;
    confirm: string;
    cancel: string;
    timeVariants: string;
  };
  validation: {
    startDateRequired: string;
    timeRequired: string;
    periodRequired: string;
    shiftRequired: string;
  };
  learningPlan: string;
}

export const learning: ILearningTranslations = {
  title: "Образовательные мероприятия",
  subtitle: "Пробные уроки, вебинары, мастер-классы, индивидуальные и групповые занятия",
  searchPlaceholder: "Поиск по названию, описанию или преподавателю...",
  loading: "Загрузка...",
  noActivities: "Мероприятия по выбранным критериям не найдены",
  filters: {
    all: "Все",
    categories: "Категории",
    showFree: "Показать только бесплатные",
    sortBy: "Сортировать по",
    popularity: "Популярности",
    rating: "Рейтингу",
    price: "Цене",
    sortOrder: "Порядок сортировки",
    asc: "По возрастанию",
    desc: "По убыванию",
    clearFilters: "Очистить фильтры",
  },
  booking: {
    title: "Бронирование",
    selectDate: "Выберите дату",
    selectTime: "Выберите время",
    bookButton: "Забронировать",
    cancelButton: "Отмена",
    success: "Вы успешно записались на мероприятие!",
    error: "Ошибка при записи на мероприятие",
    priceInfo: "Цена: {{price}} BYN",
    free: "Бесплатно",
    individualInfo: "Вы сможете выбрать удобные дни недели для индивидуальных занятий",
    groupInfo: "Вы сможете увидеть все доступные групповые занятия",
    trialInfo: "Ваше первое пробное занятие бесплатно!",
    webinarInfo: "Ссылка на вебинар будет отправлена вам после регистрации",
    masterclassInfo: "Ссылка на мастер-класс будет отправлена вам после регистрации",
  },
  guestModal: {
    title: "Требуется регистрация",
    content: "Для записи на мероприятия необходимо зарегистрироваться. Перейти на страницу регистрации?",
    register: "Зарегистрироваться",
    cancel: "Отмена",
  },
  balanceModal: {
    insufficientFunds: "Недостаточно средств",
    topUp: "Пополнить баланс",
    cancel: "Отмена",
  },
  reviews: {
    title: "Отзывы",
    writeReview: "Написать отзыв",
    rating: "Оценка",
    comment: "Комментарий",
    submit: "Отправить",
    cancel: "Отмена",
    success: "Отзыв успешно отправлен!",
    error: "Ошибка при отправке отзыва",
    noReviews: "Пока нет отзывов",
  },
  groupBooking: {
    title: "Групповые занятия",
    description: "Выберите дату и время занятия из доступных вариантов.",
    noAvailableGroups: "Нет доступных групп",
    noAvailableGroupsDescription: "На данный момент нет доступных групп для записи. Пожалуйста, обратитесь к администратору.",
    selectStartDate: "Выберите дату начала",
    selectTime: "Выберите время",
    selectedTime: "Выбранное время",
    shiftMorning: "Утренняя (9:00 - 12:00)",
    shiftDay: "Дневная (13:00 - 16:00)",
    shiftEvening: "Вечерняя (18:00 - 21:00)",
    period: "Период обучения",
    selectPeriod: "Выберите период обучения",
    sixMonths: "6 месяцев",
    oneYear: "1 год",
    shift: "Смена",
    confirm: "Подтвердить запись",
    cancel: "Отмена",
    timeVariants: "вариантов времени",
  },
  validation: {
    startDateRequired: "Выберите дату начала занятий",
    timeRequired: "Выберите время занятия",
    periodRequired: "Выберите период обучения",
    shiftRequired: "Выберите смену",
  },
  learningPlan: "Программа обучения",
};