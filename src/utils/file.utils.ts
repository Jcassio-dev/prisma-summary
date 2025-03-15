import * as vscode from 'vscode';

export async function findPrismaFiles(): Promise<vscode.Uri[]> {
  return vscode.workspace.findFiles('**/*.prisma', '**/node_modules/**');
}

export async function openPrismaFile(fileUri: vscode.Uri): Promise<vscode.TextDocument> {
  const document = await vscode.workspace.openTextDocument(fileUri);
  await vscode.window.showTextDocument(document);
  return document;
}

export async function updateDocumentContent(document: vscode.TextDocument, newContent: string): Promise<boolean> {
  const edit = new vscode.WorkspaceEdit();
  const fullRange = new vscode.Range(
    document.positionAt(0),
    document.positionAt(document.getText().length)
  );
  edit.replace(document.uri, fullRange, newContent);
  return vscode.workspace.applyEdit(edit);
}