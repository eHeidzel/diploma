import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, FindOptionsWhere } from 'typeorm';
import { Translation } from '../entities/translation.entity';
import { Language } from 'src/enums/Language.enums';

@Injectable()
export class TranslationService {
  constructor(
    @InjectRepository(Translation)
    private translationRepo: Repository<Translation>,
  ) {}

  async setTranslation(
    entityType: string,
    entityId: number,
    field: string,
    language: Language,
    value: string,
  ): Promise<Translation> {
    let translation = await this.translationRepo.findOne({
      where: {
        entityType,
        entityId,
        field,
        language,
      } as FindOptionsWhere<Translation>,
    });

    if (translation) {
      translation.value = value;
    } else {
      translation = this.translationRepo.create({
        entityType,
        entityId,
        field,
        language,
        value,
      });
    }

    return this.translationRepo.save(translation);
  }

  async getTranslation(
    entityType: string,
    entityId: number,
    field: string,
    language: Language,
  ): Promise<string | null> {
    const translation = await this.translationRepo.findOne({
      where: {
        entityType,
        entityId,
        field,
        language,
      } as FindOptionsWhere<Translation>,
    });
    return translation?.value || null;
  }

  async getTranslations(
    entityType: string,
    entityId: number,
    language: Language,
  ): Promise<Record<string, string>> {
    const translations = await this.translationRepo.find({
      where: {
        entityType,
        entityId,
        language,
      } as FindOptionsWhere<Translation>,
    });

    const result: Record<string, string> = {};
    translations.forEach((t) => {
      result[t.field] = t.value;
    });
    return result;
  }

  async getEntityTranslations(
    entityType: string,
    entityIds: number[],
    language: Language,
  ): Promise<Map<number, Record<string, string>>> {
    if (entityIds.length === 0) return new Map();

    const translations = await this.translationRepo.find({
      where: {
        entityType,
        entityId: In(entityIds),
        language,
      } as FindOptionsWhere<Translation>,
    });

    const result = new Map<number, Record<string, string>>();
    translations.forEach((t) => {
      if (!result.has(t.entityId)) {
        result.set(t.entityId, {});
      }
      result.get(t.entityId)![t.field] = t.value;
    });
    return result;
  }

  async getAllEntityTranslations(
    entityType: string,
    entityIds: number[],
  ): Promise<Map<number, Map<Language, Record<string, string>>>> {
    if (entityIds.length === 0) return new Map();

    const translations = await this.translationRepo.find({
      where: {
        entityType,
        entityId: In(entityIds),
      } as FindOptionsWhere<Translation>,
    });

    const result = new Map<number, Map<Language, Record<string, string>>>();
    translations.forEach((t) => {
      if (!result.has(t.entityId)) {
        result.set(t.entityId, new Map());
      }
      const entityMap = result.get(t.entityId)!;
      if (!entityMap.has(t.language)) {
        entityMap.set(t.language, {});
      }
      entityMap.get(t.language)![t.field] = t.value;
    });
    return result;
  }

  async deleteTranslations(
    entityType: string,
    entityId: number,
    field?: string,
    language?: Language,
  ): Promise<void> {
    const where: FindOptionsWhere<Translation> = { entityType, entityId };
    if (field) where.field = field;
    if (language) where.language = language;

    await this.translationRepo.delete(where);
  }

  async deleteAllEntityTranslations(
    entityType: string,
    entityId: number,
  ): Promise<void> {
    await this.translationRepo.delete({ entityType, entityId });
  }

  async batchSetTranslations(
    translations: Array<{
      entityType: string;
      entityId: number;
      field: string;
      language: Language;
      value: string;
    }>,
  ): Promise<Translation[]> {
    const results: Translation[] = [];
    for (const trans of translations) {
      const result = await this.setTranslation(
        trans.entityType,
        trans.entityId,
        trans.field,
        trans.language,
        trans.value,
      );
      results.push(result);
    }
    return results;
  }

  async searchTranslations(
    entityType: string,
    field: string,
    language: Language,
    searchTerm: string,
  ): Promise<Translation[]> {
    return this.translationRepo
      .createQueryBuilder('translation')
      .where('translation.entityType = :entityType', { entityType })
      .andWhere('translation.field = :field', { field })
      .andWhere('translation.language = :language', { language })
      .andWhere('translation.value LIKE :searchTerm', {
        searchTerm: `%${searchTerm}%`,
      })
      .getMany();
  }

  async getTranslationStats(): Promise<{
    totalTranslations: number;
    byEntityType: Record<string, number>;
    byLanguage: Record<string, number>;
  }> {
    const translations = await this.translationRepo.find();

    const byEntityType: Record<string, number> = {};
    const byLanguage: Record<string, number> = {};

    translations.forEach((t) => {
      byEntityType[t.entityType] = (byEntityType[t.entityType] || 0) + 1;
      byLanguage[t.language] = (byLanguage[t.language] || 0) + 1;
    });

    return {
      totalTranslations: translations.length,
      byEntityType,
      byLanguage,
    };
  }

  async cloneTranslations(
    sourceEntityType: string,
    sourceEntityId: number,
    targetEntityType: string,
    targetEntityId: number,
  ): Promise<number> {
    const translations = await this.translationRepo.find({
      where: {
        entityType: sourceEntityType,
        entityId: sourceEntityId,
      } as FindOptionsWhere<Translation>,
    });

    let clonedCount = 0;
    for (const trans of translations) {
      const exists = await this.translationRepo.findOne({
        where: {
          entityType: targetEntityType,
          entityId: targetEntityId,
          field: trans.field,
          language: trans.language,
        } as FindOptionsWhere<Translation>,
      });

      if (!exists) {
        const newTranslation = this.translationRepo.create({
          entityType: targetEntityType,
          entityId: targetEntityId,
          field: trans.field,
          language: trans.language,
          value: trans.value,
        });
        await this.translationRepo.save(newTranslation);
        clonedCount++;
      }
    }

    return clonedCount;
  }

  async exportTranslations(
    entityType: string,
    entityIds: number[],
  ): Promise<Record<number, Record<Language, Record<string, string>>>> {
    const result: Record<number, Record<Language, Record<string, string>>> = {};

    for (const entityId of entityIds) {
      const translations = await this.translationRepo.find({
        where: {
          entityType,
          entityId,
        } as FindOptionsWhere<Translation>,
      });

      result[entityId] = {} as Record<Language, Record<string, string>>;
      translations.forEach((t) => {
        if (!result[entityId][t.language]) {
          result[entityId][t.language] = {};
        }
        result[entityId][t.language][t.field] = t.value;
      });
    }

    return result;
  }

  async importTranslations(
    entityType: string,
    translationsData: Record<number, Record<Language, Record<string, string>>>,
  ): Promise<number> {
    let importedCount = 0;

    for (const [entityIdStr, languages] of Object.entries(translationsData)) {
      const entityId = parseInt(entityIdStr);

      for (const [language, fields] of Object.entries(languages)) {
        for (const [field, value] of Object.entries(fields)) {
          await this.setTranslation(
            entityType,
            entityId,
            field,
            language as Language,
            value,
          );
          importedCount++;
        }
      }
    }

    return importedCount;
  }
}
