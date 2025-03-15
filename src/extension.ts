import * as vscode from 'vscode';
import { PrismaSummaryProvider } from './PrismaSummaryProvider';
import { PrismaContentSorter } from './PrismaContentSorter';

export function activate(context: vscode.ExtensionContext) {
    console.log('Congratulations, your extension "prisma-summary" is now active!');

    const prismaSummaryProvider = new PrismaSummaryProvider(vscode.workspace.rootPath);
    vscode.window.registerTreeDataProvider('prismaSummary', prismaSummaryProvider);
    
    const refreshCommand = vscode.commands.registerCommand('prisma-summary.refreshEntry', async () => {
        prismaSummaryProvider.refresh();
        vscode.window.showInformationMessage('Prisma summary refreshed!');
    });

    const sortAndRefreshCommand = vscode.commands.registerCommand('prisma-summary.sortAndRefresh', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            const prismaFiles = await vscode.workspace.findFiles('**/*.prisma', '**/node_modules/**');
            if (prismaFiles.length > 0) {
                const document = await vscode.workspace.openTextDocument(prismaFiles[0]);
                await vscode.window.showTextDocument(document);
                await sortPrismaFile(document);
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

        await sortPrismaFile(document);
        prismaSummaryProvider.refresh();
    });

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

        await sortPrismaFile(document);
    });

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
        const summary = generateSummary(text);

        const panel = vscode.window.createWebviewPanel(
            'prismaSummary',
            'Prisma Summary',
            vscode.ViewColumn.One,
            {}
        );

        panel.webview.html = getWebviewContent(summary);
    });

    context.subscriptions.push(
        sortPrismaDisposable, 
        showSummaryDisposable, 
        refreshCommand, 
        sortAndRefreshCommand
    );
}

async function sortPrismaFile(document: vscode.TextDocument): Promise<void> {
    const text = document.getText();
    const sortedText = sortPrismaContent(text);

    const edit = new vscode.WorkspaceEdit();
    const fullRange = new vscode.Range(
        document.positionAt(0),
        document.positionAt(text.length)
    );
    edit.replace(document.uri, fullRange, sortedText);
    await vscode.workspace.applyEdit(edit);
    vscode.window.showInformationMessage('Prisma file sorted successfully!');
}


  
  function sortPrismaContent(text: string): string {
    const sorter = new PrismaContentSorter();
    return sorter.sort(text);
  }
  
function generateSummary(text: string): string[] {
    const lines = text.split('\n');
    const modelSummary: string[] = ['<h2>Models</h2><ul>'];
    const enumSummary: string[] = ['<h2>Enums</h2><ul>'];

    for (const line of lines) {
        if (line.startsWith('model ')) {
            const modelName = line.split(' ')[1];
            modelSummary.push(`<li><a href="command:revealLine?lineNumber=${lines.indexOf(line)}">${modelName}</a></li>`);
        } else if (line.startsWith('enum ')) {
            const enumName = line.split(' ')[1];
            enumSummary.push(`<li><a href="command:revealLine?lineNumber=${lines.indexOf(line)}">${enumName}</a></li>`);
        }
    }

    modelSummary.push('</ul>');
    enumSummary.push('</ul>');
    return [...modelSummary, ...enumSummary];
}

function getWebviewContent(summary: string[]): string {
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Prisma Summary</title>
        </head>
        <body>
            <button onclick="refresh()">Sort Again</button>
            ${summary.join('\n')}
            <a href="https://github.com/your-repo/prisma-summary">Star this project!</a>
            <script>
                function refresh() {
                    const vscode = acquireVsCodeApi();
                    vscode.postMessage({ command: 'refresh' });
                }
            </script>
        </body>
        </html>
    `;
}

export function deactivate() {}