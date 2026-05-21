import { AnswerDirection, QuestionType } from "../enums";

export interface IQuestionOption {
  id: number;
  text: string;
  directionScores: Record<AnswerDirection, number>;
  order: number;
}

export interface IQuestionResponse {
  id: number;
  text: string;
  type: QuestionType;
  options?: IQuestionOption[];
  explanation?: string;
}

export interface IUserAnswer {
  questionId: number;
  selectedOptionId: number;
}

export interface IDirectionResult {
  direction: AnswerDirection;
  name: string;
  description: string;
  icon: string;
  color: string;
  skills: string[];
  salary: string;
  totalScore: number;
}
