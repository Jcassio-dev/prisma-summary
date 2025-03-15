import * as vscode from 'vscode';
import { IPrismaContentSorter } from '../models/prisma.model';
import { findPrismaFiles, openPrismaFile, updateDocumentContent } from '../utils/file.utils';

export function registerSortCommands(
  context: vscode.ExtensionContext, 
  sorter: IPrismaContentSorter,
  refreshSummary: () => void
): void {
  const sortPrismaDisposable = vscode.commands.registerCommand('prisma-summary.sortPrisma', async () => {
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

    await sortPrismaFile(document, sorter);
  });

  const sortAndRefreshCommand = vscode.commands.registerCommand('prisma-summary.sortAndRefresh', async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      const prismaFiles = await findPrismaFiles();
      if (prismaFiles.length > 0) {
        const document = await openPrismaFile(prismaFiles[0]);
        await sortPrismaFile(document, sorter);
      } else {
        vscode.window.showErrorMessage('No Prisma file found!');
      }
      return;
    }

    const document = editor.document;
    if (document.languageId !== 'prisma') {
      vscode.window.showErrorMessage('Not a Prisma file!');
      return;
    }

    await sortPrismaFile(document, sorter);
    refreshSummary();
  });

  context.subscriptions.push(
    sortPrismaDisposable,
    sortAndRefreshCommand
  );
}

async function sortPrismaFile(document: vscode.TextDocument, sorter: IPrismaContentSorter): Promise<void> {
  const text = document.getText();
  const sortedText = sorter.sort(text);

  const success = await updateDocumentContent(document, sortedText);
  
  if (success) {
    vscode.window.showInformationMessage('Prisma file sorted successfully!');
  } else {
    vscode.window.showErrorMessage('Failed to sort Prisma file.');
  }
}