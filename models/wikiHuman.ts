import { Item, ItemId, WikimediaLanguageCode } from "npm:wikibase-sdk";
import { StatementId } from "./enums.ts";
import { Position } from "./position.ts";
import { WikiObject } from "./wikiObject.ts";
import { WikiUtils } from "./wikiUtils.ts";
import { formatDate } from "../common/utils.ts";

export class WikiHuman extends WikiObject {
  public fatherId?: ItemId;
  public siblingsId?: ItemId[];
  public positions?: Position[];
  public born?: Date;
  public dead?: Date;
  public familyIds?: ItemId[];

  constructor(item: Item, language: WikimediaLanguageCode) {
    super(item, language);

    this.born = WikiUtils.getStatementDate(item, StatementId.DateOfBirth);
    this.dead = WikiUtils.getStatementDate(item, StatementId.DateOfDeath);
    this.fatherId = WikiUtils.getStatement(item, StatementId.Father);
    this.siblingsId = WikiUtils.getStatements(item, StatementId.Sibling);
    this.familyIds = WikiUtils.getStatements(item, StatementId.Family);
  }

  public get reigns(): Position[] {
    return this.positions?.filter((p) => p.isKing) ?? [];
  }

  public get isKing(): boolean {
    return this.reigns.length > 0;
  }

  public get bornFormatted(): string {
    return formatDate(this.born);
  }

  public get deadFormatted(): string {
    return formatDate(this.dead);
  }

  public override toString(): string {
    let result = `${this.label} (${this.id}) [${this.born?.getFullYear()}-${this.dead?.getFullYear()}]`;
    if (this.isKing) {
      result += " ROI";
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

  public static async Create(item: Item, language: WikimediaLanguageCode): Promise<WikiHuman> {
    const human = new WikiHuman(item, language);
    human.positions = await Position.CreateList(item, language);
    return human;
  }

  public static get csvHeaderLine(): string {
    return "ID,name,isKing,born,dead";
  }

  public get csvLine(): string {
    return `${this.id},"${this.label}",${this.isKing},${this.bornFormatted},${this.deadFormatted}`;
  }
}
