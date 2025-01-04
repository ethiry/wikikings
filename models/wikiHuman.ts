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
    if (this.born && this.dead) {
      return (this.dead.getTime() - this.born.getTime()) / 31557600000;
    }
    return undefined;
  }

  public get ignore(): boolean {
    return this.age === undefined || (this.age < 10 && !this.isKing);
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

  public continuationList(language: WikimediaLanguageCode): ItemId[] {
    const result: ItemId[] = [];

    // father && mother
    if (this.fatherId) {
      result.push(this.fatherId);
    }
    if (this.motherId) {
      result.push(this.motherId);
    }

    // siblings
    // if (this.siblingsId) {
    //   result.push(...this.siblingsId);
    // }

    // spouses
    if (this.spouses) {
      result.push(...this.spouses.map((s) => s.id));
    }

    // children
    if (this.childrenId) {
      result.push(...this.childrenId);
    }

    // predecessors
    this.reigns.filter((r) => r.replaces).forEach((pred) => {
      if (pred.replaces && result.filter((id) => id === pred.replaces).length === 0) {
        result.push(pred.replaces);
      }
    });

    // successors
    this.reigns.filter((r) => r.replacedBy).forEach((succ) => {
      if (succ.replacedBy && result.filter((id) => id === succ.replacedBy).length === 0) {
        result.push(succ.replacedBy);
      }
    });

    return result;
  }
}
