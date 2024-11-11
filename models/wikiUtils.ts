import { 
  Item, 
  ItemId,
  Qualifiers,
  TimeSnakDataValue,
  WikibaseItemSnakDataValue,
  wikibaseTimeToDateObject,
} from "npm:wikibase-sdk";
import { InstanceOf, QualifierId, StatementId } from "./enums.ts";

export class WikiUtils {

  public static getStatement(item: Item, statementId: StatementId): ItemId {
    if (item.claims) {
      const claim = item.claims[statementId][0];
      if (claim && claim.mainsnak.datatype === "wikibase-item") {
        const value = claim.mainsnak.datavalue as WikibaseItemSnakDataValue;
        return value.value.id;
      }
    }
    throw new Deno.errors.InvalidData();
  }

  public static getStatements(item: Item, statementId: StatementId): ItemId[] {
    const result: ItemId[] = [];
    if (item.claims) {
      const claims = item.claims[statementId];
      for (const claim of claims) {
        if (claim && claim.mainsnak.datatype === "wikibase-item") {
          const value = claim.mainsnak.datavalue as WikibaseItemSnakDataValue;
          result.push(value.value.id);
        }
      }
    }
    return result;
  }

  public static getInstanceOf(item: Item): InstanceOf {
    const id = this.getStatement(item, StatementId.InstanceOf);
    switch (id) {
      case "Q5": return InstanceOf.Human;
      case "Q355567": return InstanceOf.NobleTitle;
      case "Q114962596": return InstanceOf.HistoricalPosition
    }
    return InstanceOf.Unknown;
  }

  public static getDateQualifier(id: QualifierId, qualifiers?: Qualifiers): Date | undefined {
    if (qualifiers) {
      const q = qualifiers[id];
      if (q && q[0] && q[0].datatype === "time" && q[0].datavalue ) {
        return wikibaseTimeToDateObject((q[0].datavalue as TimeSnakDataValue).value);
      }
    }
    return undefined;
  }

  public static getItemQualifier(id: QualifierId, qualifiers?: Qualifiers): ItemId | undefined {
    if (qualifiers) {
      const q = qualifiers[id];
      if (q && q[0] && q[0].datatype === "wikibase-item" && q[0].datavalue ) {
        const value = q[0].datavalue as WikibaseItemSnakDataValue;
        return value.value.id;
      }
    }
    return undefined;
  }
}