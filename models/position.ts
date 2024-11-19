import { Item, ItemId, Qualifiers, WikibaseItemSnakDataValue, WikimediaLanguageCode } from "npm:wikibase-sdk";
import { QualifierId } from "./enums.ts";
import { StatementId } from "./enums.ts";
import { WikiUtils } from "./wikiUtils.ts";
import { WikiObject } from "./wikiObject.ts";
import { getWikiObject } from "../wikidata.ts";

export class Position {
  private wiki: WikiObject;
  public replaces?: ItemId;
  public replacedBy?: ItemId;
  public start?: Date;
  public end?: Date;
  public isKing: boolean;

  private constructor(wiki: WikiObject, qualifiers: Qualifiers) {
    this.wiki = wiki;
    this.start = WikiUtils.getDateQualifier(QualifierId.StartTime, qualifiers);
    this.end = WikiUtils.getDateQualifier(QualifierId.EndTime, qualifiers);
    this.replaces = WikiUtils.getItemQualifier(QualifierId.Replaces, qualifiers);
    this.replacedBy = WikiUtils.getItemQualifier(QualifierId.ReplacedBy, qualifiers);
    this.isKing = Position.kingsPositions.includes(this.wiki.id);
  }

  public get label(): string {
    return this.wiki.label;
  }

  public static async CreateList(item: Item, language: WikimediaLanguageCode): Promise<Position[]> {
    if (item && item.claims) {
      const positionsHeld = item.claims[StatementId.PositionHeld];
      if (positionsHeld) {
        const result: Position[] = [];
        const claims = positionsHeld.filter((claim) => claim && claim.mainsnak.datatype === "wikibase-item");
        for (const claim of claims) {
          if (claim.qualifiers) {
            const value = claim.mainsnak.datavalue as WikibaseItemSnakDataValue;
            const position = await getWikiObject(value.value.id, language);
            result.push(new Position(position, claim.qualifiers));
          }
        }
        result.sort(Position.comparer);
        return result;
      }
    }
    return [];
  }

  private static comparer(a: Position, b: Position): number {
    if (a.start && b.start) {
      return a.start.getTime() - b.start.getTime();
    }
    return a.wiki.label.localeCompare(b.wiki.label);
  }

  private static kingsPositions = ["Q22923081", "Q18384454", "Q3439798", "Q3439814", "Q3439814"];
}
