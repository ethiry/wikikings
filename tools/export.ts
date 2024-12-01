import { ItemId } from "npm:wikibase-sdk";
import { WikiHuman } from "@/models/wikiHuman.ts";
import { formatDate, isBefore } from "@/tools/date.ts";
import { Position } from "@/models/position.ts";

export class Export {
  private solution: Map<ItemId, WikiHuman>;
  private humans: WikiHuman[];
  private folder?: string;

  public constructor(solution: Map<ItemId, WikiHuman>) {
    this.solution = solution;
    this.humans = Array.from(solution.values());
  }

  public async saveScvFiles(folder: string) {
    this.folder = folder;
    await this.saveHumans();
    await this.saveParents();
    await this.saveSiblings();
    await this.saveReplacedBy();
    await this.savePositions();
  }

  private async saveHumans() {
    await this.saveCsvFile("humans", this.humans.map((h) => h.csvLine), WikiHuman.csvHeaderLine);
  }

  private async saveParents() {
    await this.saveCsvFile(
      "parents",
      this.humans.filter((h) => h.fatherId).map((h) => `${h.fatherId},${h.id}`),
      "parentId,childId",
    );
  }

  private async saveSiblings() {
    const siblings = new Array<string>();
    for (const older of this.humans) {
      if (older.born && older.siblingsId) {
        for (const yid of older.siblingsId) {
          const younger = this.solution.get(yid);
          if (
            younger &&
            younger.born &&
            isBefore(older.born, younger.born)
          ) {
            siblings.push(`${older.id},${younger.id}`);
          }
        }
      }
    }
    await this.saveCsvFile("siblings", siblings, "oderId,youngerId");
  }

  private async saveReplacedBy() {
    const replacedBy = new Array<string>();
    this.humans.forEach((h) => {
      h.positions?.forEach((p) => {
        if (p.isKing && p.end && p.replacedBy) {
          replacedBy.push(
            `${h.id},${p.label},${formatDate(p.end)},${p.replacedBy}`,
          );
        }
      });
    });
    await this.saveCsvFile("replacedBy", replacedBy, "id,label,date,successorId");
  }

  private async savePositions() {
    const positionHolders = new Array<string>();
    const positions = new Map<ItemId, string>();
    for (const human of this.humans) {
      if (human.positions) {
        for (const position of human.positions) {
          if (position.isKing) {
            positionHolders.push(`${position.id},${human.id}`);
            if (!positions.has(position.id)) {
              positions.set(position.id, position.csvLine);
            }
          }
        }
      }
    }
    await this.saveCsvFile("positions", Array.from(positions.values()), Position.csvHeaderLine);
    await this.saveCsvFile("positionHolders", positionHolders, "positionId,holderId");
  }

  private async saveCsvFile(filename: string, lines: string[], header?: string) {
    const output = await Deno.open(`${this.folder}/${filename}.csv`, {
      create: true,
      write: true,
      truncate: true,
    });
    const outputWriter = output.writable.getWriter();
    await outputWriter.ready;

    if (header) {
      await this.writeLine(outputWriter, header);
    }
    for (const line of lines) {
      await this.writeLine(outputWriter, line);
    }

    await outputWriter.close();
  }

  private async writeLine(outputWriter: WritableStreamDefaultWriter<Uint8Array>, line: string) {
    const encoded = new TextEncoder().encode(line + "\n");
    await outputWriter.write(encoded);
  }
}
