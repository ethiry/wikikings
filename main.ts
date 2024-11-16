// import { isEntityId, ItemId  } from "npm:wikibase-sdk";
// import { getWikiObject  } from "./wikidata.ts";
// import { WikiHuman } from "./models/wikiHuman.ts";
// import { WikiObject } from "./models/wikiObject.ts";
import { WikiHuman } from "./models/wikiHuman.ts";
import { Scenario1 } from "./scenarios.ts/scenario1.ts";

/*
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
*/

const scenario = new Scenario1('fr');
const result = await scenario.run();

console.log(result.size);
const list = Array.from(result.values());
const kings = list.filter(l => l.isKing);
console.log(kings.length);
list.sort(HumanComparer);
list.forEach((k,i) => console.log(`${i}: ${k.toLongString()}`));
console.log('DONE');

function HumanComparer(a: WikiHuman, b:WikiHuman): number {
  if (a.born && b.born) {
    return a.born.getTime() - b.born.getTime();
  }
  if (a.born && !b.born) {
    return -1;
  }
  if (!a.born && b.born) {
    return 1;
  }
  return 0;
}