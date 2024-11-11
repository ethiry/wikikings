import { defaultLanguage } from "./constants.ts";
import { InstanceOf } from "./enums.ts";
import { WikiUtils } from "./wikiUtils.ts";
import { WikiObject } from "./wikiObject.ts";
import { WikiHuman } from "./wikiHuman.ts";
import { Item, WikimediaLanguageCode } from "npm:wikibase-sdk";

export class WikiFactory {
  public static Create(input: object, language: WikimediaLanguageCode = defaultLanguage): WikiObject {
    const item = input as Item;
    switch (WikiUtils.getInstanceOf(item)) {
      case InstanceOf.Human:
        return new WikiHuman(item, language);
      default:
        return new WikiObject(item, language);
    }
  }
}
