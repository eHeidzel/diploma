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
  };
  placeholders: {
    title: string;
    description: string;
    price: string;
    meetLink: string;
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
  title: "Activity Management",
  createButton: "Create Activity",
  editButton: "Edit",
  deleteButton: "Delete",
  createTitle: "Create Activity",
  editTitle: "Edit Activity",
  fields: {
    title: "Title",
    type: "Activity Type",
    categories: "Categories",
    description: "Description",
    teacher: "Teacher",
    price: "Price (BYN)",
    duration: "Duration",
    ageRange: "Age Group",
    level: "Level",
    groupPeriod: "Period",
    groupShift: "Shift",
    meetLink: "Conference Link (optional)",
    meetLinkPlaceholder: "https://meet.google.com/xxx-xxxx-xxx",
    meetLinkExtra: "Common link for all sessions of this activity",
    isActive: "Active",
  },
  placeholders: {
    title: "Enter activity title",
    description: "Enter description",
    price: "0 - free",
    meetLink: "https://meet.google.com/xxx-xxxx-xxx",
  },
  validation: {
    titleRequired: "Please enter title",
    typeRequired: "Please select type",
    categoriesRequired: "Please select categories",
    descriptionRequired: "Please enter description",
    teacherRequired: "Please select teacher",
    priceRequired: "Please enter price",
    priceMin: "Price cannot be negative",
    durationRequired: "Please select duration",
    ageRangeRequired: "Please select age group",
    levelRequired: "Please select level",
    groupPeriodRequired: "Please select period",
    groupShiftRequired: "Please select shift",
  },
  messages: {
    createSuccess: "Activity created successfully",
    updateSuccess: "Activity updated successfully",
    deleteSuccess: "Activity deleted successfully",
    deleteConfirm: "Are you sure you want to delete this activity?",
    deleteConfirmTitle: "Delete Activity",
    loadError: "Failed to load activities",
    saveError: "Failed to save activity",
    deleteError: "Failed to delete activity",
    noDates: "Add dates for the activity",
    addDate: "For this type of activity you need to specify specific dates and times",
    selectDate: "Select date",
    selectTime: "Select time",
    dateInfo: "User will choose weekdays, system will check teacher availability from 8:00 to 20:00",
    dateInfoIndividual: "User will choose weekdays, system will check teacher availability from 8:00 to 20:00",
    dateInfoTrial: "User will choose a date, system will check teacher availability from 8:00 to 20:00",
    addDateButton: "Add Date",
    removeDate: "Remove",
  },
  table: {
    id: "ID",
    title: "Title",
    type: "Type",
    categories: "Categories",
    price: "Price",
    teacher: "Teacher",
    duration: "Duration",
    meetLink: "Conference Link",
    isActive: "Active",
    actions: "Actions",
    active: "Yes",
    inactive: "No",
    notSpecified: "Not specified",
    openLink: "Open",
    free: "Free",
    notAssigned: "Not assigned",
  },
  types: {
    webinar: "Webinar",
    masterclass: "Masterclass",
    individual: "Individual",
    group: "Group",
    trial: "Trial",
  },
  durationOptions: {
    "30 мин": "30 minutes",
    "45 мин": "45 minutes (academic hour)",
    "1 час": "1 hour (astronomical hour)",
    "1.5 часа": "1.5 hours",
    "2 часа": "2 hours",
    "2.5 часа": "2.5 hours",
    "3 часа": "3 hours",
  },
  ageRanges: {
    "8-12": "8-12 years",
    "13-17": "13-17 years",
    "18-25": "18-25 years",
    "25-35": "25-35 years",
    "35+": "35+ years",
    all: "All ages",
  },
  levels: {
    beginner: "Beginner",
    intermediate: "Intermediate",
    advanced: "Advanced",
    all: "Any level",
  },
  groupPeriods: {
    "6 месяцев": "6 months",
    год: "1 year",
  },
  groupShifts: {
    утренняя: "Morning",
    дневная: "Day",
    вечерняя: "Evening",
  },
};