import { InstanceOf, Statement } from "./enums.ts";
import { ItemId, PropertyId, WikimediaLanguageCode } from "npm:wikibase-sdk";

export const defaultLanguage: WikimediaLanguageCode = "fr";
export const fallBackLanguage: WikimediaLanguageCode = "en";

export const IdToStatement: Record<PropertyId, Statement> = {
  "P31": Statement.InstanceOf,
};

export const InstanceOfToId: Record<keyof typeof InstanceOf, ItemId> = {
  Unknown: "Q0",
  Human: "Q5",
  NobleTitle: "Q355567",
  HistoricalPosition: "Q114962596",
};

export const IdToInstanceOf: Record<ItemId, InstanceOf> = {
  "Q5": InstanceOf.Human,
  "Q355567": InstanceOf.NobleTitle,
  "Q114962596": InstanceOf.HistoricalPosition,
};

// P21
export const IdToGender: Record<ItemId, string> = {
  "Q6581097": "male",
  "Q6581072": "female",
};
