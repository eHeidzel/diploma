import { QuestionType } from '@libs/shared';

export class QuestionResponseDto {
  id!: number;
  text!: string;
  type!: QuestionType;
  options?: string[];
  explanation?: string;
}
