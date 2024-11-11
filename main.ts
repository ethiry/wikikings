import { isEntityId, type ItemId  } from "npm:wikibase-sdk";
import { getWikiObject  } from "./wikidata.ts";
import { WikiHuman } from "./models/wikiHuman.ts";

const id = Deno.args[1] || 'Q7732';

if (isEntityId(id)) {
  const wiki = await getWikiObject(id as ItemId, 'fr');

  console.log(wiki.Label);
  console.log(wiki.Description);
  console.log(wiki.WikipediaLink);

  if (wiki instanceof WikiHuman) {
    console.log(wiki.FatherId);
    console.log(wiki.Positions);
    console.log(wiki.Siblings);
  }
}

console.log('DONE')