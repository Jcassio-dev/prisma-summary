import * as vscode from 'vscode';

export class PrismaWebViewProvider {
  /**
   * Creates and returns the HTML content for the webview
   * @param summary Array of summary HTML strings
   * @returns HTML content as string
   */
  static getWebviewContent(summary: string[]): string {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Prisma Summary</title>
      </head>
      <body>
          ${summary.join('\n')}
        
      </body>
      </html>
    `;
  }

  /**
   * Creates and shows a webview panel with the provided summary content
   * @param context Extension context
   * @param summary Array of summary HTML strings
   * @returns The created webview panel
   */
  static createWebviewPanel(context: vscode.ExtensionContext, summary: string[]): vscode.WebviewPanel {
    const panel = vscode.window.createWebviewPanel(
      'prismaSummary',
      'Prisma Summary',
      vscode.ViewColumn.One,
      {
        enableScripts: true,
        localResourceRoots: [
          vscode.Uri.joinPath(context.extensionUri, 'resources')
        ]
      }
    );

    panel.webview.html = this.getWebviewContent(summary);
    
    panel.webview.onDidReceiveMessage(
      message => {
        switch (message.command) {
          case 'refresh':
            vscode.commands.executeCommand('prisma-summary.sortAndRefresh');
            break;
        }
      },
      undefined,
      context.subscriptions
    );

    return panel;
  }
}