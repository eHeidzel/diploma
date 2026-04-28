import { IsString } from 'class-validator';

export class TestDto {
  @IsString()
  public name!: string;
}
