import { getSitelinkUrl, Item, ItemId, Site, Sitelinks, Term, WikimediaLanguageCode } from "npm:wikibase-sdk";
import { defaultLanguage, fallBackLanguage } from "@/common/constants.ts";

export class WikiObject {
  public id: ItemId;
  public label: string;
  public description: string;
  public wikipediaLink?: string;
  public aliases?: string[];

  constructor(item: Item, language: WikimediaLanguageCode = defaultLanguage) {
    this.id = item.id;
    this.label = this.getTranslated(language, item.labels) ?? this.id;
    this.description = this.getTranslated(language, item.descriptions) ?? this.id;
    this.wikipediaLink = this.getWikipediaLinks(language, item.sitelinks);
    if (item.aliases) {
      this.aliases = item.aliases[language]?.map((a) => a.value) ?? [];
    }
  }

  private getWikipediaLinks(language: WikimediaLanguageCode, sitelinks?: Sitelinks): string | undefined {
    if (sitelinks) {
      const site: Site = `${language}wiki` as Site;
      const info = sitelinks[site];
      if (info) {
        return getSitelinkUrl(info);
      }
    }
  }

  private getTranslated(
    language: WikimediaLanguageCode,
    field?: Partial<Readonly<Record<string, Term>>>,
  ): string | undefined {
    let result: string | undefined = undefined;
    if (field) {
      result = field[language]?.value ?? field[fallBackLanguage]?.value;
    }
    return result;
  }
}
