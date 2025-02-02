import { isItemId, ItemId } from "npm:wikibase-sdk";
import { WikiHuman } from "@/models/wikiHuman.ts";
import { Position } from "@/models/position.ts";
import { Gender } from "@/common/enums.ts";
import { formatDate, isBefore } from "@/tools/date.ts";

const csvSeparator = ",";
const csvExtension = "csv";

export type CsvType = ItemId | string | boolean | number | Gender | Date | string[] | undefined;
export type CsvLine = CsvType[];

export class Export {
  private solution: Map<ItemId, WikiHuman>;
  private humans: WikiHuman[];
  private folder: string;

  public constructor(folder: string, solution: Map<ItemId, WikiHuman>) {
    this.folder = folder;
    this.solution = solution;
    this.humans = Array.from(solution.values());

    Deno.mkdirSync(this.folder, { recursive: true });
  }

  public async saveScvFiles() {
    await this.saveHumans();
    await this.saveParents();
    await this.saveSpouses();
    await this.saveSiblings();
    await this.saveReplacedBy();
    await this.savePositions();
  }

  public async writeFile(filename: string, lines: string[]) {
    const output = await Deno.open(`${this.folder}/${filename}`, {
      create: true,
      write: true,
      truncate: true,
    });
    const outputWriter = output.writable.getWriter();
    await outputWriter.ready;

    for (const line of lines) {
      await this.writeLine(outputWriter, line);
    }

    await outputWriter.close();
  }

  private async saveHumans() {
    await this.saveCsvFile("humans", WikiHuman.csvHeaderLine, this.humans.map((h) => h.csvLine));
  }

  private async saveParents() {
    const parents = new Array<CsvLine>();
    this.humans.forEach((h) => {
      if (h.fatherId) {
        parents.push([h.fatherId, h.id, "father"]);
      }
      if (h.motherId) {
        parents.push([h.motherId, h.id, "mother"]);
      }
    });
    await this.saveCsvFile("parents", ["parentId", "childId", "type"], parents);
  }

  private async saveSpouses() {
    const spouses = new Array<CsvLine>();
    this.humans.forEach((h) => {
      if (h.gender === Gender.Male) {
        h.spouses?.forEach((s) => {
          spouses.push([h.id, s.id, s.start, s.end, s.durationInYears]);
        });
      }
    });
    await this.saveCsvFile("spouses", ["husbandId", "wifeId", "start", "end", "duration"], spouses);
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
        if (p.isKing && p.replacedBy) {
          if (p.end) {
            replacedBy.push(
              [h.id, p.label, p.kingDomain, p.end, p.replacedBy],
            );
          } else {
            console.log(`POSITION ${p.id} for ${h.label} (${h.id}) has no end date !!`);
          }
        }
      });
    });
    await this.saveCsvFile("replacedBy", ["id", "label", "domain", "date", "successorId"], replacedBy);
  }

  private async savePositions() {
    const kingPositionHolders = new Array<CsvLine>();
    const positions = new Map<ItemId, CsvLine>();
    for (const human of this.humans) {
      if (human.positions) {
        for (const position of human.positions) {
          positions.set(position.id, position.csvLine);
          if (position.isKing) {
            kingPositionHolders.push([
              position.id,
              human.id,
              position.label,
              position.kingDomain,
              position.start,
              position.end,
              position.durationInYears,
            ]);
          }
        }
      }
    }

    const allPositions = Array.from(positions.values());
    allPositions.sort(this.internalPositionsComparer);
    await this.saveCsvFile("allPositions", Position.csvHeaderLine, allPositions);
    await this.saveCsvFile("kingPositions", Position.csvHeaderLine, allPositions.filter((p) => p[2] === true));
    await this.saveCsvFile(
      "kingPositionHolders",
      ["positionId", "holderId", "label", "domain", "start", "end", "duration"],
      kingPositionHolders,
    );
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
        return `"${item.replaceAll('"', '""')}"`;
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

    return item.toString();
  }

  private async writeLine(outputWriter: WritableStreamDefaultWriter<Uint8Array>, line: string) {
    const encoded = new TextEncoder().encode(line + "\n");
    await outputWriter.write(encoded);
  }
}
