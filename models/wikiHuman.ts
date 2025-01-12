import { Item, ItemId, WikimediaLanguageCode } from "npm:wikibase-sdk";
import { Gender, QualifierValue, StatementId } from "@/common/enums.ts";
import { Position } from "./position.ts";
import { WikiObject } from "./wikiObject.ts";
import { WikiData } from "../tools/wikiDataClass.ts";
import { TimeBasedStatementHelper } from "./timeBasedStatementHelper.ts";
import { Spouse } from "@/models/spouse.ts";
import { CsvLine } from "@/tools/export.ts";
import { isBefore } from "@/tools/date.ts";

export class WikiHuman extends WikiObject {
  // simple members initialized in constructor
  public fatherId?: ItemId;
  public motherId?: ItemId;
  public siblingsId?: ItemId[];
  public childrenId?: ItemId[];
  public born?: Date;
  public dead?: Date;
  public familyIds?: ItemId[];
  public gender: Gender;
  public isMonarch: boolean = false;
  // complex members initialized in CreateNew
  public positions?: Position[];
  public spouses?: Spouse[];

  constructor(item: Item, fromCache: boolean, language: WikimediaLanguageCode) {
    super(item, fromCache, language);

    this.born = WikiData.getStatementDate(item, StatementId.DateOfBirth);
    this.dead = WikiData.getStatementDate(item, StatementId.DateOfDeath);
    this.fatherId = WikiData.getStatement(item, StatementId.Father);
    this.motherId = WikiData.getStatement(item, StatementId.Mother);
    this.siblingsId = WikiData.getStatements(item, StatementId.Sibling);
    this.childrenId = WikiData.getStatements(item, StatementId.Child);
    this.familyIds = WikiData.getStatements(item, StatementId.Family);
    this.gender = WikiData.getStatementGender(item);
    this.isMonarch = WikiData.hasStatementAndQualifier(item, StatementId.Occupation, QualifierValue.Monarch);
  }

  public static async CreateNew(item: Item, fromCache: boolean, language: WikimediaLanguageCode): Promise<WikiHuman> {
    const human = new WikiHuman(item, fromCache, language);
    human.positions = await TimeBasedStatementHelper.CreateList<Position>(StatementId.PositionHeld, item, language);
    human.spouses = await TimeBasedStatementHelper.CreateList<Spouse>(StatementId.Spouse, item, language);
    return human;
  }

  public get reigns(): Position[] {
    return this.positions?.filter((p) => p.isKing) ?? [];
  }

  public get isKing(): boolean {
    return this.reigns.length > 0;
  }

  public get age(): number | undefined {
    const end = (!this.dead && this.born && this.born.getFullYear() > 1900) ? new Date() : this.dead;
    if (this.born && end) {
      return (end.getTime() - this.born.getTime()) / 31557600000;
    }
    return undefined;
  }

  public get ignore(): boolean {
    if (this.isKing) {
      return false;
    }
    return (this.age === undefined || this.age < 10);
  }

  public override toString(): string {
    let result = `${this.label} (${this.id}) [${this.born?.getFullYear()}-${this.dead?.getFullYear()}]`;
    if (this.isKing) {
      result += " KING";
    }
    if (this.isMonarch) {
      result += " MONARCH";
    }
    return result;
  }

  public toLongString(): string {
    let result = this.toString();
    if (this.isKing) {
      result += " " +
        this.reigns.map((p) => `<${p.label}:${p.start?.getFullYear()}-${p.end?.getFullYear()}>`).join("/");
    }
    if (this.familyIds) {
      result += " *" + this.familyIds.join("*");
    }
    return result;
  }

  public static get csvHeaderLine(): string[] {
    return [
      "ID",
      "name",
      "gender",
      "isKing",
      "born",
      "dead",
      "age",
      "aliases",
    ];
  }

  public get csvLine(): CsvLine {
    return [
      this.id,
      this.label,
      this.gender,
      this.isKing,
      this.born,
      this.dead,
      this.age ?? 0,
      this.aliases,
    ];
  }

  public static comparer(a: WikiHuman, b: WikiHuman): number {
    if (a.born && b.born) {
      return isBefore(a.born, b.born) ? -1 : 1;
    }
    if (a.born && !b.born) {
      return -1;
    }
    if (!a.born && b.born) {
      return 1;
    }
    return 0;
  }

  public continuationList(): { priority: ItemId[]; regular: ItemId[] } {
    const prio = new Set<ItemId>();
    const regu: ItemId[] = [];

    if (!this.ignore) {
      // predecessors and successors
      this.reigns.forEach((r) => {
        if (r.replaces) {
          prio.add(r.replaces);
        }
        if (r.replacedBy) {
          prio.add(r.replacedBy);
        }
      });

      // father && mother
      if (this.fatherId) {
        regu.push(this.fatherId);
      }
      if (this.motherId) {
        regu.push(this.motherId);
      }

      // siblings
      // if (this.siblingsId) {
      //   result.push(...this.siblingsId);
      // }

      // spouses
      if (this.spouses) {
        regu.push(...this.spouses.map((s) => s.id));
      }

      // children
      if (this.childrenId) {
        regu.push(...this.childrenId);
      }
    }

    const priority = Array.from(prio);
    const regular = regu.filter((id) => !priority.includes(id));

    return { priority, regular };
  }
}
