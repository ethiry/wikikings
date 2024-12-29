import { isItemId, ItemId } from "npm:wikibase-sdk";
import { WikiHuman } from "@/models/wikiHuman.ts";
import { Position } from "@/models/position.ts";
import dayjs, { Dayjs } from "dayjs";
import { Gender } from "@/common/enums.ts";

const csvSeparator = ",";
const csvExtension = "csv";

export type CsvType = ItemId | string | boolean | Gender | Dayjs | string[] | undefined;
export type CsvLine = CsvType[];

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
    await this.saveCsvFile("humans", WikiHuman.csvHeaderLine, this.humans.map((h) => h.csvLine));
  }

  private async saveParents() {
    await this.saveCsvFile(
      "parents",
      ["parentId", "childId"],
      this.humans.filter((h) => h.fatherId).map((h) => [h.fatherId, h.id]),
    );
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
            older.born.isBefore(younger.born)
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
    const positionHolders = new Array<CsvLine>();
    const positions = new Map<ItemId, CsvLine>();
    for (const human of this.humans) {
      if (human.positions) {
        for (const position of human.positions) {
          if (position.isKing) {
            positionHolders.push([position.id, human.id]);
            if (!positions.has(position.id)) {
              positions.set(position.id, position.csvLine);
            }
          }
        }
      }
    }
    await this.saveCsvFile("positions", Position.csvHeaderLine, Array.from(positions.values()));
    await this.saveCsvFile("positionHolders", ["positionId", "holderId"], positionHolders);
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
    if (dayjs.isDayjs(item)) {
      return [
        item.year().toString().padStart(4, "0"),
        (item.month() + 1).toString().padStart(2, "0"),
        item.date().toString().padStart(2, "0"),
      ].join("-");
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
