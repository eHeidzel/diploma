import { Language } from "../enums/language.enum";

export interface ITranslation {
  id: number;
  entityId: number;
  field: string;
  language: Language;
  value: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITranslationInput {
  entityId: number;
  field: string;
  language: Language;
  value: string;
}
