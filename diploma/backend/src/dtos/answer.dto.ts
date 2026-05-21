import { IsNumber, IsOptional, IsString } from 'class-validator';

export class AnswerDto {
  @IsNumber()
  questionId!: number;

  @IsString()
  @IsOptional()
  answer?: string | string[];
}
