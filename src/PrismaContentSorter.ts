import { IPrismaContentSorter, TBlockType, TPrismaBlock, TSeparatedBlocks } from "./types";

export class PrismaContentSorter implements IPrismaContentSorter {
    sort(text: string): string {
      const blocks = this.separateBlocks(text);
      return this.combineBlocks(blocks);
    }
  
    private separateBlocks(text: string): TSeparatedBlocks {
      const lines = text.split('\n');
      const models: string[] = [];
      const enums: string[] = [];
      const otherLines: string[] = [];
  
      let currentBlock: TPrismaBlock = [];
      let currentType: TBlockType = 'other';
  
      for (const line of lines) {
        const blockTypeDetected = this.detectBlockType(line);
        
        if (blockTypeDetected !== null && blockTypeDetected !== currentType) {
          this.storeCurrentBlock(currentBlock, currentType, models, enums, otherLines);
          currentBlock = [line];
          currentType = blockTypeDetected;
        } else {
          currentBlock.push(line);
        }
      }
  
      this.storeCurrentBlock(currentBlock, currentType, models, enums, otherLines);
  
      return { models, enums, otherLines };
    }
  
    private detectBlockType(line: string): TBlockType | null {
        const [lineStart] = line.trim();

        if(!['model', 'enum'].includes(lineStart)) return null;

        return lineStart as TBlockType;
    }
  
    private storeCurrentBlock(
      currentBlock: TPrismaBlock, 
      currentType: TBlockType, 
      models: string[], 
      enums: string[], 
      otherLines: string[]
    ): void {
      if (!currentBlock.length) return;
  
      const blockContent = currentBlock.join('\n');

      
      switch (currentType) {
        case 'model':
          models.push(blockContent);
          break;
        case 'enum':
          enums.push(blockContent);
          break;
        case 'other':
          otherLines.push(...currentBlock);
          break;
      }
    }
  
    private combineBlocks(blocks: TSeparatedBlocks): string {
      const { models, enums, otherLines } = blocks;
      
      models.sort();
      enums.sort();
      
      return [...otherLines, ...models, ...enums].join('\n');
    }
  }