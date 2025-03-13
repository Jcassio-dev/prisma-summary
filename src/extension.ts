import * as vscode from 'vscode';
import { PrismaSummaryProvider } from './PrismaSummaryProvider';

export function activate(context: vscode.ExtensionContext) {
    console.log('Congratulations, your extension "prisma-sorter" is now active!');

    const prismaSummaryProvider = new PrismaSummaryProvider(vscode.workspace.rootPath);
    vscode.window.registerTreeDataProvider('prismaSummary', prismaSummaryProvider);
    
    // Register refresh command
    const refreshCommand = vscode.commands.registerCommand('prisma-sorter.refreshEntry', async () => {
        prismaSummaryProvider.refresh();
        vscode.window.showInformationMessage('Prisma summary refreshed!');
    });

    // Register sort and refresh command
    const sortAndRefreshCommand = vscode.commands.registerCommand('prisma-sorter.sortAndRefresh', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            // Try to find and open a Prisma file
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

    const sortPrismaDisposable = vscode.commands.registerCommand('prisma-sorter.sortPrisma', async () => {
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

    const showSummaryDisposable = vscode.commands.registerCommand('prisma-sorter.showSummary', async () => {
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
    const lines = text.split('\n');
    const models: string[] = [];
    const enums: string[] = [];
    let otherLines: string[] = [];

    let currentBlock: string[] = [];
    let currentType: 'model' | 'enum' | 'other' = 'other';

    for (const line of lines) {
        if (line.startsWith('model ')) {
            if (currentBlock.length > 0) {
                if (currentType === 'model') models.push(currentBlock.join('\n'));
                else if (currentType === 'enum') enums.push(currentBlock.join('\n'));
                else otherLines = otherLines.concat(currentBlock);
            }
            currentBlock = [line];
            currentType = 'model';
        } else if (line.startsWith('enum ')) {
            if (currentBlock.length > 0) {
                if (currentType === 'model') models.push(currentBlock.join('\n'));
                else if (currentType === 'enum') enums.push(currentBlock.join('\n'));
                else otherLines = otherLines.concat(currentBlock);
            }
            currentBlock = [line];
            currentType = 'enum';
        } else {
            currentBlock.push(line);
        }
    }

    if (currentBlock.length > 0) {
        if (currentType === 'model') models.push(currentBlock.join('\n'));
        else if (currentType === 'enum') enums.push(currentBlock.join('\n'));
        else otherLines = otherLines.concat(currentBlock);
    }

    models.sort();
    enums.sort();

    return [ ...otherLines, ...models, ...enums].join('\n');
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
            <a href="https://github.com/your-repo/prisma-sorter">Star this project!</a>
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