import { QuestionType } from "src/enums/QuestionType.enums";

export class QuestionResponseDto {
  id!: number;
  text!: string;
  type!: QuestionType;
  options?: string[];
  explanation?: string;
}
