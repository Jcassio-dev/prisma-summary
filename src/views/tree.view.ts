import * as vscode from 'vscode';
import { findPrismaFiles } from '../utils/file.utils';

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

        if (!element) {
            return [
                new CategoryItem('Models', vscode.TreeItemCollapsibleState.Expanded),
                new CategoryItem('Enums', vscode.TreeItemCollapsibleState.Expanded)
            ];
        }

        if (element instanceof CategoryItem) {
            return this.getModelsOrEnums(prismaFilePath, element.label);
        }

        return [];
    }

    private async getPrismaFilePath(): Promise<string | undefined> {
        const prismaFiles = await findPrismaFiles();
        return prismaFiles.length > 0 ? prismaFiles[0].fsPath : undefined;
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

export abstract class PrismaItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly command?: vscode.Command
    ) {
        super(label, collapsibleState);
    }
}

export class CategoryItem extends PrismaItem {
    constructor(
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState
    ) {
        super(label, collapsibleState);
        this.contextValue = 'category';
    }
}

export class ModelItem extends PrismaItem {
    constructor(
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly command?: vscode.Command
    ) {
        super(label, collapsibleState);
        this.contextValue = 'model';
    }
}

export class EnumItem extends PrismaItem {
    constructor(
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly command?: vscode.Command
    ) {
        super(label, collapsibleState);
        this.contextValue = 'enum';
    }
}