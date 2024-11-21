import type { ItemId, WikimediaLanguageCode } from "npm:wikibase-sdk";
import type { WikiHuman } from "@/models/wikiHuman.ts";

export abstract class ScenarioBase {
  protected language: WikimediaLanguageCode;

  constructor(language: WikimediaLanguageCode) {
    this.language = language;
  }

  public abstract run(): Promise<Map<ItemId, WikiHuman>>;
  protected abstract mustStop(id: ItemId): boolean;
}
