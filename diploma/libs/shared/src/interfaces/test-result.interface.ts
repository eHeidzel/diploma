import { IDirectionResult } from "@interfaces/question.interface";

export interface ITestResult {
  results: IDirectionResult[];
  topDirection: IDirectionResult;
  recommendations: string[];
}
