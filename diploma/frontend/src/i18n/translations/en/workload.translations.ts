export interface IWorkloadTranslations {
  title: string;
  loading: string;
  noData: string;
  filter: {
    dateRange: string;
    show: string;
  };
  stats: {
    total: string;
    completed: string;
    planned: string;
    cancelled: string;
    hours: string;
  };
  table: {
    date: string;
    activity: string;
    time: string;
    duration: string;
    hours: string;
    hourType: string;
    status: string;
    academic: string;
    astronomical: string;
  };
  statuses: {
    planned: string;
    completed: string;
    cancelled: string;
    in_progress: string;
  };
}

export const workload: IWorkloadTranslations = {
  title: "My Workload",
  loading: "Loading workload...",
  noData: "No data for the selected period",
  filter: {
    dateRange: "Date Range",
    show: "Show",
  },
  stats: {
    total: "Total Hours",
    completed: "Completed",
    planned: "Planned",
    cancelled: "Cancelled",
    hours: "astr. h",
  },
  table: {
    date: "Date",
    activity: "Activity",
    time: "Time",
    duration: "Duration",
    hours: "Hours (astr.)",
    hourType: "Hour Type",
    status: "Status",
    academic: "Academic",
    astronomical: "Astronomical",
  },
  statuses: {
    planned: "Planned",
    completed: "Completed",
    cancelled: "Cancelled",
    in_progress: "In Progress",
  },
};