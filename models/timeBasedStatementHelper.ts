import { Position } from "@/models/position.ts";
import { StatementId } from "@/common/enums.ts";
import { Item, ItemId, Qualifiers, WikibaseItemSnakDataValue, WikimediaLanguageCode } from "npm:wikibase-sdk";
import { TimeBasedStatement } from "@/models/timeBasedStatement.ts";
import { WikiData } from "@/tools/wikiData.ts";
import { Spouse } from "@/models/spouse.ts";
import { isBefore } from "@/tools/date.ts";

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
            result.push(await this.CreateNew(statementId, value.value.id, claim.qualifiers, language) as T);
          }
        }
        result.sort(this.comparer);
        return result;
      }
    }
    return undefined;
  }

  private static async CreateNew(
    statementId: StatementId,
    id: ItemId,
    qualifiers: Qualifiers,
    language: WikimediaLanguageCode,
  ): Promise<TimeBasedStatement> {
    switch (statementId) {
      case StatementId.PositionHeld:
        return new Position(id, await this.getLabel(id, language), qualifiers);
      case StatementId.Spouse:
        return new Spouse(id, qualifiers);
    }
    throw new Error(`Unknown statementId=${statementId}`);
  }

  private static async getLabel(id: ItemId, language: WikimediaLanguageCode): Promise<string> {
    const obj = await WikiData.getWikiObject(id, language);
    if (obj) {
      return obj.label;
    }
    return "";
  }

  private static comparer(a: TimeBasedStatement, b: TimeBasedStatement): number {
    if (a.start && b.start) {
      return isBefore(a.start, b.start) ? -1 : 1;
    }
    return a.id.localeCompare(b.id);
  }
}
