import { 
  Item,
  ItemId,
  Claim, 
  WikibaseItemSnakDataValue,
} from "npm:wikibase-sdk";
import { QualifierId } from "./enums.ts";
import { StatementId } from "./enums.ts";
import { WikiUtils } from "./wikiUtils.ts";

export class Position {
  public itemId: ItemId;
  public replaces?: ItemId;
  public replacedBy?: ItemId;
  public start?: Date;
  public end?: Date;

  public constructor(claim: Claim) {
      const value = claim.mainsnak.datavalue as WikibaseItemSnakDataValue;
      this.itemId = value.value.id;
      this.start = WikiUtils.getDateQualifier(QualifierId.StartTime, claim.qualifiers);
      this.end = WikiUtils.getDateQualifier(QualifierId.EndTime, claim.qualifiers);
      this.replaces = WikiUtils.getItemQualifier(QualifierId.Replaces, claim.qualifiers);
      this.replacedBy = WikiUtils.getItemQualifier(QualifierId.ReplacedBy, claim.qualifiers);
  }

  public static Factory(item: Item): Position[] {
    if (item && item.claims) {
      return item.claims[StatementId.PositionHeld]
                .filter(claim => claim && claim.mainsnak.datatype === "wikibase-item")
                .map(claim => new Position(claim));
    }
    return [];
  }
}