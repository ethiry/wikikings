import { Position } from "@/models/position.ts";
import { StatementId } from "@/common/enums.ts";
import { WikiObject } from "@/models/wikiObject.ts";
import { Item, Qualifiers, WikibaseItemSnakDataValue, WikimediaLanguageCode } from "npm:wikibase-sdk";
import { TimeBasedStatement } from "@/models/timeBasedStatement.ts";
import { WikiData } from "@/tools/wikiData.ts";
import { Spouse } from "@/models/spouse.ts";

export class TimeBasedStatementHelper {
  public static async CreateList<T extends TimeBasedStatement>(
    statementId: StatementId,
    item: Item,
    language: WikimediaLanguageCode,
  ): Promise<T[] | undefined> {
    if (item && item.claims) {
      const claims = item.claims[statementId]?.filter((claim) => claim && claim.mainsnak.datatype === "wikibase-item");
      if (claims) {
        const result: T[] = [];
        for (const claim of claims) {
          if (claim.mainsnak.datavalue && claim.qualifiers) {
            const value = claim.mainsnak.datavalue as WikibaseItemSnakDataValue;
            const obj = await WikiData.getWikiObject(value.value.id, language);
            result.push(this.CreateNew(statementId, obj, claim.qualifiers) as T);
          }
        }
        result.sort(this.comparer);
        return result;
      }
    }
    return undefined;
  }

  private static create<Type>(c: { new (): Type }): Type {
    return new c();
  }

  private static CreateNew(statementId: StatementId, wiki: WikiObject, qualifiers: Qualifiers): TimeBasedStatement {
    switch (statementId) {
      case StatementId.PositionHeld:
        return new Position(wiki, qualifiers);
      case StatementId.Spouse:
        return new Spouse(wiki, qualifiers);
    }
    throw new Error(`Unknown statementId=${statementId}`);
  }

  private static comparer(a: TimeBasedStatement, b: TimeBasedStatement): number {
    if (a.start && b.start) {
      return a.start.isBefore(b.start) ? -1 : 1;
    }
    return a.label.localeCompare(b.label);
  }
}
