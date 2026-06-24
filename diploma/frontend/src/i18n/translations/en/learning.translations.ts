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
};