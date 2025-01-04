import { isItemId, ItemId } from "npm:wikibase-sdk";
import { WikiHuman } from "@/models/wikiHuman.ts";
import { Position } from "@/models/position.ts";
import { Gender } from "@/common/enums.ts";
import { formatDate, isBefore } from "@/tools/date.ts";

const csvSeparator = ",";
const csvExtension = "csv";

export type CsvType = ItemId | string | boolean | Gender | Date | string[] | undefined;
export type CsvLine = CsvType[];

export class Export {
  private solution: Map<ItemId, WikiHuman>;
  private humans: WikiHuman[];
  private folder: string;

  public constructor(folder: string, solution: Map<ItemId, WikiHuman>) {
    this.folder = folder;
    this.solution = solution;
    this.humans = Array.from(solution.values());
  }

  public async saveScvFiles() {
    await this.saveHumans();
    await this.saveParents();
    await this.saveSiblings();
    await this.saveReplacedBy();
    await this.savePositions();
  }

  private async saveHumans() {
    await this.saveCsvFile("humans", WikiHuman.csvHeaderLine, this.humans.map((h) => h.csvLine));
  }

  private async saveParents() {
    const parents = new Array<CsvLine>();
    this.humans.forEach((h) => {
      if (h.fatherId) {
        parents.push([h.fatherId, h.id]);
      }
      if (h.motherId) {
        parents.push([h.motherId, h.id]);
      }
    });
    await this.saveCsvFile("parents", ["parentId", "childId"], parents);
  }

  private async saveSpouses() {
    const spouses = new Array<CsvLine>();
    this.humans.forEach((h) => {
      h.spouses?.forEach((s) => {
        spouses.push([h.id, s.id, s.start, s.end]);
      });
    });
    await this.saveCsvFile("spouses", ["husbandId", "wifeId", "start", "end"], spouses);
  }

  private async saveSiblings() {
    const siblings = new Array<CsvLine>();
    for (const older of this.humans) {
      if (older.born && older.siblingsId) {
        for (const yid of older.siblingsId) {
          const younger = this.solution.get(yid);
          if (
            younger &&
            younger.born &&
            isBefore(older.born, younger.born)
          ) {
            siblings.push([older.id, younger.id]);
          }
        }
      }
    }
    await this.saveCsvFile("siblings", ["olderId", "youngerId"], siblings);
  }

  private async saveReplacedBy() {
    const replacedBy = new Array<CsvLine>();
    this.humans.forEach((h) => {
      h.positions?.forEach((p) => {
        if (p.isKing && p.end && p.replacedBy) {
          replacedBy.push(
            [h.id, p.label, p.end, p.replacedBy],
          );
        }
      });
    });
    await this.saveCsvFile("replacedBy", ["id", "label", "date", "successorId"], replacedBy);
  }

  private async savePositions() {
    const kingPositionHolders = new Array<CsvLine>();
    const positions = new Map<ItemId, CsvLine>();
    for (const human of this.humans) {
      if (human.positions) {
        for (const position of human.positions) {
          positions.set(position.id, position.csvLine);
          if (position.isKing) {
            kingPositionHolders.push([position.id, human.id]);
          }
        }
      }
    }

    const allPositions = Array.from(positions.values());
    allPositions.sort(this.internalPositionsComparer);
    await this.saveCsvFile("allPositions", Position.csvHeaderLine, allPositions);
    await this.saveCsvFile("kingPositions", Position.csvHeaderLine, allPositions.filter((p) => p[2] === true));
    await this.saveCsvFile("kingPositionHolders", ["positionId", "holderId"], kingPositionHolders);
  }

  private internalPositionsComparer(a: CsvLine, b: CsvLine): number {
    if (a[0] && b[0] && typeof a[0] === "string" && typeof b[0] === "string") {
      return a[0].localeCompare(b[0]);
    }
    return 0;
  }

  private async saveCsvFile(filename: string, header: string[], lines: CsvLine[]) {
    const output = await Deno.open(`${this.folder}/${filename}.${csvExtension}`, {
      create: true,
      write: true,
      truncate: true,
    });
    const outputWriter = output.writable.getWriter();
    await outputWriter.ready;

    if (header) {
      await this.writeLine(outputWriter, this.makeHeaderLine(header));
    }
    for (const line of lines) {
      await this.writeLine(outputWriter, this.makeCsvLine(line));
    }

    await outputWriter.close();
  }

  private makeHeaderLine(header: string[]): string {
    return header.join(csvSeparator);
  }

  private makeCsvLine(line: CsvLine): string {
    return line.map((item) => this.makeCsvItem(item)).join(csvSeparator);
  }

  private makeCsvItem(item: CsvType): string {
    if (typeof item === "undefined") {
      return "";
    }
    if (typeof item === "string") {
      if (isItemId(item) || item.length === 1) {
        return item;
      } else {
        return `"${item}"`;
      }
    }
    if (item instanceof Date) {
      return formatDate(item);
    }
    if (Array.isArray(item)) {
      return `"${item.map((a) => a.replaceAll('"', '\\"')).join("|")}"`;
    }
    if (typeof item === "boolean") {
      return item ? "true" : "false";
    }

    return item;
  }

  private async writeLine(outputWriter: WritableStreamDefaultWriter<Uint8Array>, line: string) {
    const encoded = new TextEncoder().encode(line + "\n");
    await outputWriter.write(encoded);
  }
}
