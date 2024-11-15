import { 
  Item, 
  ItemId, 
  WikimediaLanguageCode,
} from "npm:wikibase-sdk";
import { StatementId } from "./enums.ts";
import { Position } from "./position.ts";
import { WikiObject } from "./wikiObject.ts";
import { WikiUtils } from "./wikiUtils.ts";

export class WikiHuman extends WikiObject {
  public fatherId?: ItemId;
  public siblingsId?: ItemId[];
  public positions?: Position[];
  public born?: Date;
  public dead?: Date;

  constructor(item: Item, language: WikimediaLanguageCode) {
    super(item, language);

    this.born = WikiUtils.getStatementDate(item, StatementId.DateOfBirth);
    this.dead = WikiUtils.getStatementDate(item, StatementId.DateOfDeath);
    this.fatherId = WikiUtils.getStatement(item, StatementId.Father);
    this.siblingsId = WikiUtils.getStatements(item, StatementId.Sibling);
  }

  public get reigns(): Position[] {
    return this.positions?.filter(p => p.isKing) ?? []
  }

  public get isKing(): boolean {
    return this.reigns.length > 0;
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
      result += " " + this.reigns.map(p => `<${p.label}:${p.start?.getFullYear()}-${p.end?.getFullYear()}>`).join("/");
    }
    return result;
  }

  public static async Create(item: Item, language: WikimediaLanguageCode): Promise<WikiHuman> {
    const human = new WikiHuman(item, language);
    human.positions = await Position.CreateList(item, language);
    return human;
  }
}
