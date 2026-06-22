export interface IDashboardHomeTranslations {
  stats: {
    students: string;
    teachers: string;
    projects: string;
  };
  projects: {
    title: string;
    subtitle: string;
    noProjects: string;
    demo: string;
  };
  teachers: {
    title: string;
    subtitle: string;
    noTeachers: string;
    more: string;
  };
  reviews: {
    title: string;
    subtitle: string;
    noReviews: string;
    create: string;
    createTitle: string;
    editTitle: string;
    rating: string;
    ratingRequired: string;
    text: string;
    textRequired: string;
    textPlaceholder: string;
    textMin: string;
    textMax: string;
    submit: string;
    authRequired: string;
    createSuccess: string;
    updateSuccess: string;
    deleteSuccess: string;
    error: string;
    deleteError: string;
    deleteConfirm: string;
    deleteDescription: string;
  };
}

export const dashboardHome: IDashboardHomeTranslations = {
  stats: {
    students: "Students",
    teachers: "Teachers",
    projects: "Projects",
  },
  projects: {
    title: "Student Projects",
    subtitle: "Real projects by our graduates",
    noProjects: "No projects",
    demo: "Demo",
  },
  teachers: {
    title: "Our Teachers",
    subtitle: "Experienced practitioners from leading IT companies",
    noTeachers: "No teachers",
    more: "More about the teacher",
  },
  reviews: {
    title: "Student Reviews",
    subtitle: "Real reviews about our school",
    noReviews: "No reviews yet. Be the first!",
    create: "Leave a review",
    createTitle: "Leave a review about the school",
    editTitle: "Edit review",
    rating: "Rating",
    ratingRequired: "Please rate",
    text: "Your review",
    textRequired: "Please write a review",
    textPlaceholder: "Share your impressions about the school...",
    textMin: "Review must contain at least 10 characters",
    textMax: "Review must not exceed 1000 characters",
    submit: "Submit review",
    authRequired: "Only authorized students can leave reviews",
    createSuccess: "Thank you for your review!",
    updateSuccess: "Review updated",
    deleteSuccess: "Review deleted",
    error: "Error submitting review",
    deleteError: "Error deleting review",
    deleteConfirm: "Delete review",
    deleteDescription: "Are you sure you want to delete your review?",
  },
};