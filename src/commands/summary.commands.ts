import * as vscode from 'vscode';
import { IPrismaSummaryGenerator } from '../models/prisma.model';
import { PrismaWebViewProvider } from '../views/webview.view';

export function registerSummaryCommands(
  context: vscode.ExtensionContext, 
  summaryGenerator: IPrismaSummaryGenerator
): void {
  const showSummaryDisposable = vscode.commands.registerCommand('prisma-summary.showSummary', async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showErrorMessage('No active editor found!');
      return;
    }

    const document = editor.document;
    if (document.languageId !== 'prisma') {
      vscode.window.showErrorMessage('Not a Prisma file!');
      return;
    }

    const text = document.getText();
    const summary = summaryGenerator.generateSummary(text);
    
    PrismaWebViewProvider.createWebviewPanel(context, summary);
  });

  context.subscriptions.push(showSummaryDisposable);
}