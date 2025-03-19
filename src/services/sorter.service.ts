import {  IPrismaContentSorter, ISeparatedBlocks } from '../models/prisma.model';

export class PrismaContentSorter implements IPrismaContentSorter {
  sort(text: string): string {
    const blocks = this.separateBlocks(text);
    return this.combineBlocks(blocks);
  }

  private separateBlocks(text: string): ISeparatedBlocks {
    const modelRegex = /model\s+\w+\s*{[\s\S]*?}/g;
    const enumRegex = /enum\s+\w+\s*{[\s\S]*?}/g;

    const models = text.match(modelRegex) || [];
    const enums = text.match(enumRegex) || [];

    let remainingText = text;
    models.forEach(block => {
      remainingText = remainingText.replace(block, '');
    });
    enums.forEach(block => {
      remainingText = remainingText.replace(block, '');
    });

    const otherLines = remainingText.split('\n')
      .map(line => line.trimEnd())
      .filter(line => line.trim() !== '');

    return { models, enums, otherLines };
  }

  private combineBlocks(blocks: ISeparatedBlocks): string {
    const { models, enums, otherLines } = blocks;

    models.sort((a, b) => this.extractName(a).localeCompare(this.extractName(b)));
    enums.sort((a, b) => this.extractName(a).localeCompare(this.extractName(b)));

    return [...otherLines, '', ...models, '', ...enums].join('\n');
  }

  private extractName(block: string): string {
    const firstLine = block.split('\n')[0];
    const parts = firstLine.split(' ');
    return parts[1] || '';
  }
}