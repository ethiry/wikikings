import { defaultLanguage } from "@/common/constants.ts";
import { InstanceOf } from "@/common/enums.ts";
import { WikiUtils } from "@/tools/wikiUtils.ts";
import { WikiObject } from "./wikiObject.ts";
import { WikiHuman } from "./wikiHuman.ts";
import { Item, WikimediaLanguageCode } from "npm:wikibase-sdk";

export class WikiFactory {
  public static async Create(input: object, language: WikimediaLanguageCode = defaultLanguage): Promise<WikiObject> {
    const item = input as Item;
    switch (WikiUtils.getInstanceOf(item)) {
      case InstanceOf.Human:
        return await WikiHuman.CreateNew(item, language);
      default:
        return new WikiObject(item, language);
    }
  }
}
