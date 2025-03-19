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

    // Caso não haja elemento, exibe as categorias
    if (!element) {
      return [
        new CategoryItem("Models", vscode.TreeItemCollapsibleState.Expanded),
        new CategoryItem("Enums", vscode.TreeItemCollapsibleState.Expanded),
      ];
    }

    // Se o elemento é uma categoria, retorna os models ou enums
    if (element instanceof CategoryItem) {
      return this.getModelsOrEnums(prismaFilePath, element.label);
    }

    // Se o elemento for um Model ou Enum, retorna as propriedades ou valores respectivamente
    if (element.contextValue === "model") {
      return this.getModelProperties(prismaFilePath, element.label);
    }

    if (element.contextValue === "enum") {
      return this.getEnumValues(prismaFilePath, element.label);
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
      ? new ModelItem(name, vscode.TreeItemCollapsibleState.Collapsed, command)
      : new EnumItem(name, vscode.TreeItemCollapsibleState.Collapsed, command);
  }

  private async getModelProperties(
    prismaFilePath: string,
    modelName: string
  ): Promise<PrismaItem[]> {
    const fileContent = await vscode.workspace.fs.readFile(
      vscode.Uri.file(prismaFilePath)
    );
    const text = Buffer.from(fileContent).toString("utf8");
    const properties = this.extractModelProperties(text, modelName);
    return properties.map(
      (prop) =>
        new PropertyItem(
          `${prop.name}: ${prop.type}`,
          vscode.TreeItemCollapsibleState.None,
          {
            command: "vscode.open",
            title: "",
            arguments: [
              vscode.Uri.file(prismaFilePath),
              { selection: new vscode.Range(prop.line, 0, prop.line, 0) },
            ],
          }
        )
    );
  }

  private extractModelProperties(
    text: string,
    modelName: string
  ): { name: string; type: string; line: number }[] {
    const regex = new RegExp(`model\\s+${modelName}\\s*{([\\s\\S]*?)}`, "m");

    const match = regex.exec(text);

    if (!match) return [];

    const block = match[1];
    const lines = block.split("\n");
    const allLines = text.split("\n");
    const modelStartLine = allLines.findIndex((line) =>
      line.includes(`model ${modelName}`)
    );

    const properties: { name: string; type: string; line: number }[] = [];

    let currentLine = modelStartLine + 1;

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("//") && trimmed !== "}") {
        const propMatch = /^(\w+)\s+([\w\[\]]+)/.exec(trimmed);
        if (propMatch) {
          properties.push({
            name: propMatch[1],
            type: propMatch[2],
            line: currentLine,
          });
        }
      }
      currentLine++;
    }
    return properties;
  }

  private async getEnumValues(
    prismaFilePath: string,
    enumName: string
  ): Promise<PrismaItem[]> {
    const fileContent = await vscode.workspace.fs.readFile(
      vscode.Uri.file(prismaFilePath)
    );
    const text = Buffer.from(fileContent).toString("utf8");
    const values = this.extractEnumValues(text, enumName);
    return values.map(
      (val) =>
        new EnumValueItem(val.value, vscode.TreeItemCollapsibleState.None, {
          command: "vscode.open",
          title: "",
          arguments: [
            vscode.Uri.file(prismaFilePath),
            { selection: new vscode.Range(val.line, 0, val.line, 0) },
          ],
        })
    );
  }

  private extractEnumValues(
    text: string,
    enumName: string
  ): { value: string; line: number }[] {
    const regex = new RegExp(`enum\\s+${enumName}\\s*{([\\s\\S]*?)}`, "m");
    const match = regex.exec(text);

    if (!match) return [];

    const block = match[1];
    const lines = block.split("\n");
    const allLines = text.split("\n");

    const enumStartLine = allLines.findIndex((line) =>
      line.includes(`enum ${enumName}`)
    );
    const values: { value: string; line: number }[] = [];

    let currentLine = enumStartLine + 1;

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("//") && trimmed !== "}") {
        values.push({
          value: trimmed.replace(",", "").trim(),
          line: currentLine,
        });
      }
      currentLine++;
    }
    return values;
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
    if (label === "Models") {
      this.iconPath = new vscode.ThemeIcon("database");
    } else if (label === "Enums") {
      this.iconPath = new vscode.ThemeIcon("symbol-enum");
    }
  }
}

export class ModelItem extends PrismaItem {
  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly command?: vscode.Command
  ) {
    super(label, collapsibleState, command);
    this.contextValue = "model";
    this.iconPath = new vscode.ThemeIcon("table");
  }
}

export class EnumItem extends PrismaItem {
  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly command?: vscode.Command
  ) {
    super(label, collapsibleState, command);
    this.contextValue = "enum";
    this.iconPath = new vscode.ThemeIcon("symbol-enum-member");
  }
}

export class PropertyItem extends PrismaItem {
  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly command?: vscode.Command
  ) {
    super(label, collapsibleState, command);
    this.contextValue = "property";
    this.iconPath = new vscode.ThemeIcon("symbol-property");
  }
}

export class EnumValueItem extends PrismaItem {
  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly command?: vscode.Command
  ) {
    super(label, collapsibleState, command);
    this.contextValue = "enumValue";
    this.iconPath = new vscode.ThemeIcon("symbol-enum");
  }
}
