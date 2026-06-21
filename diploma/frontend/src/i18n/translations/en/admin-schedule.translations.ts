export interface IAdminScheduleTranslations {
  title: string;
  addButton: string;
  infoMessage: string;
  fields: {
    activity: string;
    teacher: string;
    date: string;
    time: string;
    maxStudents: string;
  };
  placeholders: {
    activity: string;
    teacher: string;
    date: string;
    time: string;
  };
  validation: {
    activityRequired: string;
    teacherRequired: string;
    dateRequired: string;
    datePast: string;
    timeRequired: string;
    timeRange: string;
    timeEndAfterStart: string;
    timeMinDuration: string;
    timeMaxDuration: string;
    timeWorkingHours: string;
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
  };
  table: {
    date: string;
    time: string;
    activity: string;
    teacher: string;
    students: string;
    status: string;
    actions: string;
  };
  statuses: {
    planned: string;
    in_progress: string;
    completed: string;
    cancelled: string;
  };
  modals: {
    createTitle: string;
    editTitle: string;
    cancel: string;
    save: string;
    add: string;
  };
  maxStudentsOptions: {
    "1": string;
    "5": string;
    "10": string;
    "15": string;
    "20": string;
    "30": string;
  };
}

export const adminSchedule: IAdminScheduleTranslations = {
  title: "Schedule Management",
  addButton: "Add Class",
  infoMessage: "School operates from 8:00 AM to 8:00 PM. Lessons can only be created within this interval. Minimum duration - 30 minutes, maximum - 4 hours.",
  fields: {
    activity: "Activity",
    teacher: "Teacher",
    date: "Date",
    time: "Time",
    maxStudents: "Max Students",
  },
  placeholders: {
    activity: "Select activity",
    teacher: "Select teacher",
    date: "Select date",
    time: "Select time",
  },
  validation: {
    activityRequired: "Please select activity",
    teacherRequired: "Please select teacher",
    dateRequired: "Please select date",
    datePast: "Cannot create classes in the past",
    timeRequired: "Please select time",
    timeRange: "Lessons are only possible from 8:00 AM to 8:00 PM",
    timeEndAfterStart: "End time must be after start time",
    timeMinDuration: "Minimum duration is 30 minutes",
    timeMaxDuration: "Maximum duration is 4 hours",
    timeWorkingHours: "Classes are only possible from 8:00 AM to 8:00 PM",
  },
  messages: {
    createSuccess: "Class added to schedule",
    updateSuccess: "Class updated",
    deleteSuccess: "Class deleted",
    deleteConfirm: "Are you sure you want to delete this class?",
    deleteConfirmTitle: "Delete Class",
    loadError: "Failed to load data",
    saveError: "Error saving",
    deleteError: "Error deleting",
  },
  table: {
    date: "Date",
    time: "Time",
    activity: "Activity",
    teacher: "Teacher",
    students: "Students",
    status: "Status",
    actions: "Actions",
  },
  statuses: {
    planned: "Planned",
    in_progress: "In Progress",
    completed: "Completed",
    cancelled: "Cancelled",
  },
  modals: {
    createTitle: "Add Class",
    editTitle: "Edit Class",
    cancel: "Cancel",
    save: "Save",
    add: "Add",
  },
  maxStudentsOptions: {
    "1": "1 (Individual)",
    "5": "5",
    "10": "10",
    "15": "15",
    "20": "20",
    "30": "30",
  },
};