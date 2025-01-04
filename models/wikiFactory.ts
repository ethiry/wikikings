import { defaultLanguage } from "@/common/constants.ts";
import { InstanceOf } from "@/common/enums.ts";
import { WikiData } from "@/tools/wikiDataClass.ts";
import { WikiObject } from "./wikiObject.ts";
import { WikiHuman } from "./wikiHuman.ts";
import { Item, WikimediaLanguageCode } from "npm:wikibase-sdk";

export class WikiFactory {
  public static async Create(input: object, language: WikimediaLanguageCode = defaultLanguage): Promise<WikiObject> {
    const item = input as Item;
    switch (WikiData.getInstanceOf(item)) {
      case InstanceOf.Human:
        return await WikiHuman.CreateNew(item, language);
      default:
        return new WikiObject(item, language);
    }
  }
}
