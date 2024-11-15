import { defaultLanguage } from "./constants.ts";
import { InstanceOf } from "./enums.ts";
import { WikiUtils } from "./wikiUtils.ts";
import { WikiObject } from "./wikiObject.ts";
import { WikiHuman } from "./wikiHuman.ts";
import { Item, WikimediaLanguageCode } from "npm:wikibase-sdk";
import { Position } from "./position.ts";

export class WikiFactory {
  public static async Create(input: object, language: WikimediaLanguageCode = defaultLanguage): Promise<WikiObject> {
    const item = input as Item;
    switch (WikiUtils.getInstanceOf(item)) {
      case InstanceOf.Human:
        return await WikiHuman.Create(item, language);
      default:
        return new WikiObject(item, language);
    }
  }
}
