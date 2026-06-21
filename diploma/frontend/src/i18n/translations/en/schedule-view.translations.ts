export interface IScheduleViewTranslations {
  title: string;
  teacherTitle: string;
  loading: string;
  views: {
    week: string;
    day: string;
    list: string;
  };
  navigation: {
    today: string;
    previous: string;
    next: string;
  };
  noLessons: string;
  details: {
    title: string;
    activity: string;
    date: string;
    time: string;
    teacher: string;
    room: string;
    meetLink: string;
    connect: string;
    enrolled: string;
    viewStudents: string;
  };
  students: {
    title: string;
    noStudents: string;
  };
  request: {
    title: string;
    label: string;
    placeholder: string;
    send: string;
    cancel: string;
    success: string;
    error: string;
    minLength: string;
    maxLength: string;
  };
  statuses: {
    planned: string;
    in_progress: string;
    completed: string;
    cancelled: string;
  };
  meetLink: {
    available: string;
    hasLink: string;
  };
}

export const scheduleView: IScheduleViewTranslations = {
  title: "Class Schedule",
  teacherTitle: "My Classes",
  loading: "Loading schedule...",
  views: {
    week: "Week",
    day: "Day",
    list: "List",
  },
  navigation: {
    today: "Today",
    previous: "Previous",
    next: "Next",
  },
  noLessons: "No lessons for the selected date",
  details: {
    title: "Lesson Details",
    activity: "Activity",
    date: "Date",
    time: "Time",
    teacher: "Teacher",
    room: "Room",
    meetLink: "Meeting Link",
    connect: "Connect",
    enrolled: "Enrolled students",
    viewStudents: "View student list",
  },
  students: {
    title: "Student List",
    noStudents: "No enrolled students",
  },
  request: {
    title: "Request to Administrator",
    label: "Request Text",
    placeholder: "Describe the reason for the request (minimum 10 characters)",
    send: "Send Request",
    cancel: "Cancel",
    success: "Request sent to administrator",
    error: "Error sending request",
    minLength: "Text must contain at least 10 characters",
    maxLength: "Text must not exceed 500 characters",
  },
  statuses: {
    planned: "Planned",
    in_progress: "In Progress",
    completed: "Completed",
    cancelled: "Cancelled",
  },
  meetLink: {
    available: "Link available",
    hasLink: "Has link",
  },
};