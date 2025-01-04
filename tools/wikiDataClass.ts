import {
  Claim,
  DataType,
  Item,
  ItemId,
  Qualifiers,
  TimeSnakDataValue,
  WBK,
  WikibaseItemSnakDataValue,
  wikibaseTimeToDateObject,
  WikimediaLanguageCode,
} from "npm:wikibase-sdk";
import { Gender, InstanceOf, QualifierId, QualifierValue, StatementId } from "@/common/enums.ts";
import { Config } from "@/tools/config.ts";
import { WikiObject } from "@/models/wikiObject.ts";
import { WikiFactory } from "@/models/wikiFactory.ts";

const wbk = WBK({
  instance: "https://www.wikidata.org",
  sparqlEndpoint: "https://query.wikidata.org/sparql",
});

export class WikiData {
  public static async getWikiObject(id: ItemId, language: WikimediaLanguageCode): Promise<WikiObject> {
    const path = this.entityCacheFile(id);
    let json = {};
    let fromCache = false;

    try {
      json = JSON.parse(Deno.readTextFileSync(path));
      fromCache = true;
    } catch {
      const url = wbk.getEntities({
        ids: [id],
        languages: [language], // returns all languages if not specified
        //      props: [ 'info', 'datatype', 'descriptions', 'labels', "claims", "sitelinks", "sitelinks/urls", ""], // returns all props if not specified
      });
      const { entities } = await fetch(url).then((res) => res.json());
      json = entities[id];
      Deno.writeTextFileSync(path, JSON.stringify(json));
    }

    return await WikiFactory.Create(json, fromCache, language);
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
    return undefined;
  }

  public static hasStatementAndQualifier(
    item: Item,
    statementId: StatementId,
    qualifierValue: QualifierValue,
  ): boolean {
    if (item.claims) {
      const claims = item.claims[statementId];
      if (claims) {
        for (const claim of claims) {
          if (this.claimhasValue(claim, "wikibase-item")) {
            return (claim.mainsnak.datavalue as WikibaseItemSnakDataValue).value.id === qualifierValue;
          }
        }
      }
    }
    return false;
  }

  public static getStatementGender(item: Item): Gender {
    switch (this.getStatement(item, StatementId.Gender)) {
      case QualifierValue.Female:
        return Gender.Female;
      case QualifierValue.Male:
        return Gender.Male;
    }
    return Gender.Unknown;
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
      case QualifierValue.Human:
        return InstanceOf.Human;
      case QualifierValue.NobleTitle:
        return InstanceOf.NobleTitle;
      case QualifierValue.HistoricalPosition:
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
        return (q[0].datavalue as WikibaseItemSnakDataValue).value.id;
      }
    }
    return undefined;
  }

  private static claimhasValue(claim: Claim, datatype: DataType): boolean {
    return claim && claim.mainsnak.datatype === datatype && claim.mainsnak.snaktype === "value";
  }

  private static entityCacheFile(id: ItemId): string {
    return `${Config.cacheFolder}/${id}.json`;
  }
}
