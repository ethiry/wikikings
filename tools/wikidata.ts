import { ItemId, WBK, WikimediaLanguageCode } from "npm:wikibase-sdk";
import { WikiObject } from "@/models/wikiObject.ts";
import { WikiFactory } from "@/models/wikiFactory.ts";
import { Config } from "@/tools/config.ts";

const wbk = WBK({
  instance: "https://www.wikidata.org",
  sparqlEndpoint: "https://query.wikidata.org/sparql",
});

function entityCacheFile(id: ItemId): string {
  return `${Config.cacheFolder}/${id}.json`;
}

export async function getWikiObject(id: ItemId, language: WikimediaLanguageCode): Promise<WikiObject> {
  const path = entityCacheFile(id);
  let json = {};

  try {
    json = JSON.parse(Deno.readTextFileSync(path));
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

  return await WikiFactory.Create(json);
}
