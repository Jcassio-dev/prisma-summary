import * as vscode from 'vscode';
import { registerAllCommands } from './commands';
import { PrismaContentSorter } from './services/sorter.service';
import { PrismaSummaryGenerator } from './services/summary.service';
import { PrismaSummaryProvider } from './views/tree.view';

export function activate(context: vscode.ExtensionContext) {
  console.log('Prisma Summary extension is now active!');

  // Inicializar serviços
  const sorter = new PrismaContentSorter();
  const summaryGenerator = new PrismaSummaryGenerator();
  
  // Inicializar UI
  const prismaSummaryProvider = new PrismaSummaryProvider(vscode.workspace.rootPath);
  vscode.window.registerTreeDataProvider('prismaSummary', prismaSummaryProvider);
  
  // Registrar comandos
  registerAllCommands(
    context,
    sorter,
    summaryGenerator,
    () => prismaSummaryProvider.refresh()
  );
}

export function deactivate() {}