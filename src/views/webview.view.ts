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
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
              padding: 0 20px;
            }
            button {
              background-color: #007acc;
              border: none;
              color: white;
              padding: 8px 16px;
              text-align: center;
              text-decoration: none;
              display: inline-block;
              font-size: 14px;
              margin: 4px 2px;
              cursor: pointer;
              border-radius: 2px;
            }
            a {
              color: #007acc;
              text-decoration: none;
            }
            a:hover {
              text-decoration: underline;
            }
            .footer {
              margin-top: 20px;
              font-size: 12px;
              color: #888;
            }
          </style>
      </head>
      <body>
          <button onclick="refresh()">Sort Again</button>
          ${summary.join('\n')}
          <div class="footer">
            <a href="https://github.com/your-repo/prisma-summary">Star this project on GitHub!</a>
          </div>
          <script>
              const vscode = acquireVsCodeApi();
              function refresh() {
                  vscode.postMessage({ command: 'refresh' });
              }
          </script>
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