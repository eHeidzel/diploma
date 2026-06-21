import { IWorkloadTranslations } from "../en/workload.translations";

export const workload: IWorkloadTranslations = {
  title: "Моя нагрузка",
  loading: "Загрузка нагрузки...",
  noData: "Нет данных за выбранный период",
  filter: {
    dateRange: "Период",
    show: "Показать",
  },
  stats: {
    total: "Всего часов",
    completed: "Проведено",
    planned: "Запланировано",
    cancelled: "Отменено",
    hours: "астр. ч",
  },
  table: {
    date: "Дата",
    activity: "Занятие",
    time: "Время",
    duration: "Длительность",
    hours: "Часы (астроном.)",
    hourType: "Тип часа",
    status: "Статус",
    academic: "Академический",
    astronomical: "Астрономический",
  },
  statuses: {
    planned: "Запланировано",
    completed: "Проведено",
    cancelled: "Отменено",
    in_progress: "В процессе",
  },
};