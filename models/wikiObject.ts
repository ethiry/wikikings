import { getSitelinkUrl, Item, ItemId, Site, Term, WikimediaLanguageCode } from "npm:wikibase-sdk";
import { StatementId } from "./enums.ts";
import { WikiUtils } from "./wikiUtils.ts";
import { fallBackLanguage } from "./constants.ts";

export class WikiObject {
  protected Item : Item;
  protected Language: WikimediaLanguageCode;

  constructor(item: Item, language: WikimediaLanguageCode) {
    this.Item = item;
    this.Language = language;
  }
  
  public get Label(): string {
    return this.getTranslated(this.Item.labels);
  }

  public get Description(): string {
    return this.getTranslated(this.Item.descriptions);
  }

  private getTranslated(field?: Partial<Readonly<Record<string, Term>>>): string {
    let result: string | undefined = undefined;
    if (field) {
      result = field[this.Language]?.value ?? field[fallBackLanguage]?.value;
    }
    return result ?? this.Item.id;

  }

  public get WikipediaLink(): string {
    if (this.Item.sitelinks) {
      const site: Site = `${this.Language}wiki` as Site;
      const info = this.Item.sitelinks[site];
      if (info) {
        return getSitelinkUrl(info);
      }
    }
    return "";
  }

  public getStatement(statementId: StatementId): ItemId {
    return WikiUtils.getStatement(this.Item, statementId);
  }

  public getStatements(statementId: StatementId): ItemId[] {
    return WikiUtils.getStatements(this.Item, statementId);
  }
}

