export interface IMyStudentsTranslations {
  title: string;
  searchPlaceholder: string;
  filterGroup: string;
  allGroups: string;
  noGroup: string;
  noStudents: string;
  loading: string;
  profile: {
    title: string;
    loading: string;
    phone: string;
    group: string;
    progress: string;
    completedLessons: string;
    averageRating: string;
    noRating: string;
    individual: string;
  };
  table: {
    student: string;
    group: string;
    actions: string;
    viewProfile: string;
  };
}

export const myStudents: IMyStudentsTranslations = {
  title: "My Students",
  searchPlaceholder: "Search by name or email",
  filterGroup: "Filter by group",
  allGroups: "All groups",
  noGroup: "No group",
  noStudents: "No students",
  loading: "Loading...",
  profile: {
    title: "Student Profile",
    loading: "Loading profile...",
    phone: "Phone",
    group: "Group",
    progress: "Progress",
    completedLessons: "Completed Lessons",
    averageRating: "Average Rating",
    noRating: "No ratings",
    individual: "Individual",
  },
  table: {
    student: "Student",
    group: "Group",
    actions: "Actions",
    viewProfile: "Profile",
  },
};