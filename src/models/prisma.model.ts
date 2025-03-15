export type TBlockType = 'model' | 'enum' | 'other';
export type TPrismaBlock = string[];

export type TPrismaCategory = 'Models' | 'Enums';
export type PrismaDefinition = { name: string; lineNumber: number; type: TPrismaCategory };

export interface ISeparatedBlocks {
  models: string[];
  enums: string[];
  otherLines: string[];
}

export interface IPrismaContentSorter {
  sort(text: string): string;
}

export interface IPrismaSummaryGenerator {
  generateSummary(text: string): string[];
}