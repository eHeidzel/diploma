import { IDirectionResult } from "./question.interface";

export interface ITestResult {
  results: IDirectionResult[];
  topDirection: IDirectionResult;
  recommendations: string[];
}
