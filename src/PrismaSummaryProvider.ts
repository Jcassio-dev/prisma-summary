import * as vscode from 'vscode';
import * as path from 'path';

export class PrismaSummaryProvider implements vscode.TreeDataProvider<PrismaItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<PrismaItem | undefined | void> = new vscode.EventEmitter<PrismaItem | undefined | void>();
    readonly onDidChangeTreeData: vscode.Event<PrismaItem | undefined | void> = this._onDidChangeTreeData.event;

    constructor(private workspaceRoot: string | undefined) {}

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: PrismaItem): vscode.TreeItem {
        return element;
    }

    async getChildren(element?: PrismaItem): Promise<PrismaItem[]> {
        if (!this.workspaceRoot) {
            vscode.window.showInformationMessage('No Prisma file in empty workspace');
            return Promise.resolve([]);
        }

        const prismaFilePath = await this.getPrismaFilePath();
        if (!prismaFilePath) {
            vscode.window.showInformationMessage('No Prisma file found');
            return Promise.resolve([]);
        }

        // If no element is provided, return top-level categories
        if (!element) {
            return [
                new CategoryItem('Models', vscode.TreeItemCollapsibleState.Expanded),
                new CategoryItem('Enums', vscode.TreeItemCollapsibleState.Expanded)
            ];
        }

        // If element is a category, return its children
        if (element instanceof CategoryItem) {
            return this.getModelsOrEnums(prismaFilePath, element.label);
        }

        return [];
    }

    private getPrismaFilePath(): Promise<string | undefined> {
        if (this.workspaceRoot) {
            const prismaFiles = vscode.workspace.findFiles('**/*.prisma', '**/node_modules/**');
            if (prismaFiles) {
                return Promise.resolve(prismaFiles).then(files => files.length > 0 ? files[0].fsPath : undefined);
            }
        }
        return Promise.resolve(undefined);
    }

    private async getModelsOrEnums(prismaFilePath: string, category: string): Promise<PrismaItem[]> {
        const text = await vscode.workspace.fs.readFile(vscode.Uri.file(prismaFilePath)).then(buffer => buffer.toString());
        const lines = text.split('\n');
        const items: PrismaItem[] = [];

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (category === 'Models' && line.startsWith('model ')) {
                const modelName = line.split(' ')[1];
                items.push(new ModelItem(modelName, vscode.TreeItemCollapsibleState.None, {
                    command: 'vscode.open',
                    title: '',
                    arguments: [vscode.Uri.file(prismaFilePath), { selection: new vscode.Range(i, 0, i, 0) }]
                }));
            } else if (category === 'Enums' && line.startsWith('enum ')) {
                const enumName = line.split(' ')[1];
                items.push(new EnumItem(enumName, vscode.TreeItemCollapsibleState.None, {
                    command: 'vscode.open',
                    title: '',
                    arguments: [vscode.Uri.file(prismaFilePath), { selection: new vscode.Range(i, 0, i, 0) }]
                }));
            }
        }

        return items.sort((a, b) => a.label.localeCompare(b.label));
    }
}

// Base class for all items
export abstract class PrismaItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly command?: vscode.Command
    ) {
        super(label, collapsibleState);
    }
}

// Category item (Models or Enums)
export class CategoryItem extends PrismaItem {
    constructor(
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState
    ) {
        super(label, collapsibleState);
        this.contextValue = 'category';
    }
}

// Model item
export class ModelItem extends PrismaItem {
    constructor(
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly command?: vscode.Command
    ) {
        super(label, collapsibleState);
        this.contextValue = 'model';
        this.iconPath = {
            light: vscode.Uri.file(path.join(__filename, '..', '..', 'resources', 'light', 'model.svg')),
            dark: vscode.Uri.file(path.join(__filename, '..', '..', 'resources', 'dark', 'model.svg'))
        };
    }
}

// Enum item
export class EnumItem extends PrismaItem {
    constructor(
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly command?: vscode.Command
    ) {
        super(label, collapsibleState);
        this.contextValue = 'enum';
        this.iconPath = {
            light: vscode.Uri.file(path.join(__filename, '..', '..', 'resources', 'light', 'enum.svg')),
            dark: vscode.Uri.file(path.join(__filename, '..', '..', 'resources', 'dark', 'enum.svg'))
        };
    }
}