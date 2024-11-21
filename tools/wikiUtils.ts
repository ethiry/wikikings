import {
  Claim,
  DataType,
  Item,
  ItemId,
  Qualifiers,
  TimeSnakDataValue,
  WikibaseItemSnakDataValue,
  wikibaseTimeToDateObject,
} from "npm:wikibase-sdk";
import { InstanceOf, QualifierId, StatementId } from "@/common/enums.ts";

export class WikiUtils {
  private static claimhasValue(claim: Claim, datatype: DataType): boolean {
    return claim && claim.mainsnak.datatype === datatype && claim.mainsnak.snaktype === "value";
  }

  public static getStatement(item: Item, statementId: StatementId): ItemId | undefined {
    if (item.claims) {
      const claims = item.claims[statementId];
      if (claims) {
        const claim = claims[0];
        if (this.claimhasValue(claim, "wikibase-item")) {
          return (claim.mainsnak.datavalue as WikibaseItemSnakDataValue).value.id;
        }
      }
    }
    console.log(`For item=${item.id} no statement ${statementId}`);
    return undefined;
  }

  public static getStatementDate(item: Item, statementId: StatementId): Date | undefined {
    if (item.claims) {
      const claims = item.claims[statementId];
      if (claims) {
        const claim = claims[0];
        if (this.claimhasValue(claim, "time")) {
          return wikibaseTimeToDateObject((claim.mainsnak.datavalue as TimeSnakDataValue).value);
        }
      }
    }
    return undefined;
  }

  public static getStatements(item: Item, statementId: StatementId): ItemId[] {
    const result: ItemId[] = [];
    if (item.claims) {
      const claims = item.claims[statementId];
      if (claims) {
        for (const claim of claims) {
          if (this.claimhasValue(claim, "wikibase-item")) {
            result.push((claim.mainsnak.datavalue as WikibaseItemSnakDataValue).value.id);
          }
        }
      }
    }
    return result;
  }

  public static getInstanceOf(item: Item): InstanceOf {
    const id = this.getStatement(item, StatementId.InstanceOf);
    switch (id) {
      case "Q5":
        return InstanceOf.Human;
      case "Q355567":
        return InstanceOf.NobleTitle;
      case "Q114962596":
        return InstanceOf.HistoricalPosition;
    }
    return InstanceOf.Unknown;
  }

  public static getDateQualifier(id: QualifierId, qualifiers?: Qualifiers): Date | undefined {
    if (qualifiers) {
      const q = qualifiers[id];
      if (q && q[0] && q[0].datatype === "time" && q[0].datavalue) {
        return wikibaseTimeToDateObject((q[0].datavalue as TimeSnakDataValue).value);
      }
    }
    return undefined;
  }

  public static getItemQualifier(id: QualifierId, qualifiers?: Qualifiers): ItemId | undefined {
    if (qualifiers) {
      const q = qualifiers[id];
      if (q && q[0] && q[0].datatype === "wikibase-item" && q[0].datavalue) {
        const value = q[0].datavalue as WikibaseItemSnakDataValue;
        return value.value.id;
      }
    }
    return undefined;
  }
}
