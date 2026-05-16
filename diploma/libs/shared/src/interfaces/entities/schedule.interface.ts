export interface Schedule {
  id: number;
  subjectId: number;
  teacherId: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  room: string | null;
}
