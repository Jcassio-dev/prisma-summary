import * as vscode from "vscode";
import { findPrismaFiles } from "../utils/file.utils";

export class PrismaSummaryProvider
  implements vscode.TreeDataProvider<PrismaItem>
{
  private _onDidChangeTreeData: vscode.EventEmitter<
    PrismaItem | undefined | void
  > = new vscode.EventEmitter<PrismaItem | undefined | void>();
  readonly onDidChangeTreeData: vscode.Event<PrismaItem | undefined | void> =
    this._onDidChangeTreeData.event;

  constructor(private workspaceRoot: string | undefined) {}

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: PrismaItem): vscode.TreeItem {
    return element;
  }

  async getChildren(element?: PrismaItem): Promise<PrismaItem[]> {
    if (!this.workspaceRoot) {
      vscode.window.showInformationMessage("No Prisma file in empty workspace");
      return Promise.resolve([]);
    }

    const prismaFilePath = await this.getPrismaFilePath();
    if (!prismaFilePath) {
      vscode.window.showInformationMessage("No Prisma file found");
      return Promise.resolve([]);
    }

    if (!element) {
      return [
        new CategoryItem("Models", vscode.TreeItemCollapsibleState.Expanded),
        new CategoryItem("Enums", vscode.TreeItemCollapsibleState.Expanded),
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

  private async getModelsOrEnums(
    prismaFilePath: string,
    category: string
  ): Promise<PrismaItem[]> {
    try {
      const fileContent = await vscode.workspace.fs.readFile(
        vscode.Uri.file(prismaFilePath)
      );
      const text = Buffer.from(fileContent).toString("utf8");
      const lines = text.split("\n");

      const prismaElements = lines
        .map((line, index) => ({
          line: line.trim(),
          index,
        }))
        .filter(({ line }) => this.isRelevantForCategory(line, category))
        .map(({ line, index }) => {
          const name = this.extractNameFromLine(line);
          return this.createPrismaItem(name, category, prismaFilePath, index);
        });

      return prismaElements.sort((a, b) => a.label.localeCompare(b.label));
    } catch (error) {
      vscode.window.showErrorMessage(
        `Error parsing Prisma file: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
      return [];
    }
  }
  private isRelevantForCategory(line: string, category: string): boolean {
    const categoryKeywords: { [key: string]: string } = {
      Models: "model ",
      Enums: "enum ",
    };

    return (
      category in categoryKeywords &&
      line.startsWith(categoryKeywords[category])
    );
  }

  private extractNameFromLine(line: string): string {
    const parts = line.split(/\s+/);

    if (parts.length >= 2) {
      return parts[1].replace("{", "").trim();
    }

    return "";
  }

  private createPrismaItem(
    name: string,
    category: string,
    filePath: string,
    lineIndex: number
  ): PrismaItem {
    const command = {
      command: "vscode.open",
      title: "",
      arguments: [
        vscode.Uri.file(filePath),
        { selection: new vscode.Range(lineIndex, 0, lineIndex, 0) },
      ],
    };

    return category === "Models"
      ? new ModelItem(name, vscode.TreeItemCollapsibleState.None, command)
      : new EnumItem(name, vscode.TreeItemCollapsibleState.None, command);
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
    this.contextValue = "category";
  }
}

export class ModelItem extends PrismaItem {
  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly command?: vscode.Command
  ) {
    super(label, collapsibleState);
    this.contextValue = "model";
  }
}

export class EnumItem extends PrismaItem {
  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly command?: vscode.Command
  ) {
    super(label, collapsibleState);
    this.contextValue = "enum";
  }
}
