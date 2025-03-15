import * as vscode from 'vscode';
import { IPrismaContentSorter, IPrismaSummaryGenerator } from '../models/prisma.model';
import { registerSortCommands } from './sort.commands';
import { registerSummaryCommands } from './summary.commands';

export function registerAllCommands(
  context: vscode.ExtensionContext,
  sorter: IPrismaContentSorter,
  summaryGenerator: IPrismaSummaryGenerator,
  refreshSummary: () => void
): void {
  registerSortCommands(context, sorter, refreshSummary);
  registerSummaryCommands(context, summaryGenerator);
  
  const refreshCommand = vscode.commands.registerCommand('prisma-summary.refreshEntry', () => {
    refreshSummary();
    vscode.window.showInformationMessage('Prisma summary refreshed!');
  });
  
  context.subscriptions.push(refreshCommand);
}