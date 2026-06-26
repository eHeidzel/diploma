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
  title: "Educational Activities",
  subtitle: "Trial lessons, webinars, masterclasses, individual and group sessions",
  searchPlaceholder: "Search by title, description or teacher...",
  loading: "Loading...",
  noActivities: "No activities matching the selected criteria",
  filters: {
    all: "All",
    categories: "Categories",
    showFree: "Show only free",
    sortBy: "Sort by",
    popularity: "Popularity",
    rating: "Rating",
    price: "Price",
    sortOrder: "Sort order",
    asc: "Ascending",
    desc: "Descending",
    clearFilters: "Clear filters",
  },
  booking: {
    title: "Booking",
    selectDate: "Select date",
    selectTime: "Select time",
    bookButton: "Book",
    cancelButton: "Cancel",
    success: "You have successfully booked the activity!",
    error: "Error booking the activity",
    priceInfo: "Price: {{price}} BYN",
    free: "Free",
    individualInfo: "You will be able to choose convenient weekdays for individual sessions",
    groupInfo: "You will be able to see all available group sessions",
    trialInfo: "Your first trial lesson is free!",
    webinarInfo: "You will receive a webinar link after registration",
    masterclassInfo: "A masterclass link will be sent to you after registration",
  },
  guestModal: {
    title: "Registration Required",
    content: "You need to register to book activities. Go to registration page?",
    register: "Register",
    cancel: "Cancel",
  },
  balanceModal: {
    insufficientFunds: "Insufficient balance",
    topUp: "Top Up",
    cancel: "Cancel",
  },
  reviews: {
    title: "Reviews",
    writeReview: "Write Review",
    rating: "Rating",
    comment: "Comment",
    submit: "Submit",
    cancel: "Cancel",
    success: "Review submitted successfully!",
    error: "Error submitting review",
    noReviews: "No reviews yet",
  },
  groupBooking: {
    title: "Group classes",
    description: "Select date and time from available options.",
    noAvailableGroups: "No available groups",
    noAvailableGroupsDescription: "There are no available groups at the moment. Please contact the administrator.",
    selectStartDate: "Select start date",
    selectTime: "Select time",
    selectedTime: "Selected time",
    shiftMorning: "Morning (9:00 - 12:00)",
    shiftDay: "Day (13:00 - 16:00)",
    shiftEvening: "Evening (18:00 - 21:00)",
    period: "Study period",
    selectPeriod: "Select study period",
    sixMonths: "6 months",
    oneYear: "1 year",
    shift: "Shift",
    confirm: "Confirm booking",
    cancel: "Cancel",
    timeVariants: "time variants",
  },
  validation: {
    startDateRequired: "Please select a start date",
    timeRequired: "Please select a time",
    periodRequired: "Please select a study period",
    shiftRequired: "Please select a shift",
  },
  learningPlan: "Curriculum",
};