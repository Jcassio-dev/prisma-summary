type TBlockType = 'model' | 'enum' | 'other';
type TPrismaBlock = string[];
type TSeparatedBlocks = {
  models: string[];
  enums: string[];
  otherLines: string[];
};


interface IPrismaContentSorter {
    sort(text: string): string;
  }


export {
    TBlockType,
    TPrismaBlock,
    TSeparatedBlocks,
    IPrismaContentSorter
}