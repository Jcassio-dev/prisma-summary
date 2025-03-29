import { IPrismaSummaryGenerator } from "../models/prisma.model";

export class PrismaSummaryGenerator implements IPrismaSummaryGenerator {
  generateSummary(text: string): string[] {
    const lines = text.split("\n");
    return [
      ...this.generateModelSummary(lines),
      ...this.generateEnumSummary(lines),
    ];
  }

  private generateModelSummary(lines: string[]): string[] {
    const modelSummary: string[] = ["<h2>Models</h2><ul>"];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.startsWith("model ")) {
        const modelName = line.split(" ")[1];
        modelSummary.push(this.createSummaryItem(modelName, i));
      }
    }

    modelSummary.push("</ul>");
    return modelSummary;
  }

  private generateEnumSummary(lines: string[]): string[] {
    const enumSummary: string[] = ["<h2>Enums</h2><ul>"];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.startsWith("enum ")) {
        const enumName = line.split(" ")[1];
        enumSummary.push(this.createSummaryItem(enumName, i));
      }
    }

    enumSummary.push("</ul>");
    return enumSummary;
  }

  private createSummaryItem(name: string, lineNumber: number): string {
    return `<li><a href="command:revealLine?lineNumber=${lineNumber}">${name}</a></li>`;
  }
}
