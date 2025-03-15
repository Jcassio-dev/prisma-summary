import * as vscode from 'vscode';
import { registerAllCommands } from './commands';
import { PrismaContentSorter } from './services/sorter.service';
import { PrismaSummaryGenerator } from './services/summary.service';
import { PrismaSummaryProvider } from './views/tree.view';

export function activate(context: vscode.ExtensionContext) {
  console.log('Prisma Summary extension is now active!');

  const sorter = new PrismaContentSorter();
  const summaryGenerator = new PrismaSummaryGenerator();
  
  const prismaSummaryProvider = new PrismaSummaryProvider(vscode.workspace.rootPath);
  vscode.window.registerTreeDataProvider('prismaSummary', prismaSummaryProvider);
  
  registerAllCommands(
    context,
    sorter,
    summaryGenerator,
    () => prismaSummaryProvider.refresh()
  );
}

export function deactivate() {}