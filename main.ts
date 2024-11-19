// import { isEntityId, ItemId  } from "npm:wikibase-sdk";
// import { getWikiObject  } from "./wikidata.ts";
// import { WikiHuman } from "./models/wikiHuman.ts";
// import { WikiObject } from "./models/wikiObject.ts";
import { saveScvFiles } from "./export.ts";
import { WikiHuman } from "./models/wikiHuman.ts";
import { Scenario1 } from "./scenarios/scenario1.ts";

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

const scenario = new Scenario1("fr");
const solution = await scenario.run();

console.log(solution.size);
const humans = Array.from(solution.values());
const kings = humans.filter((l) => l.isKing);
console.log(kings.length);

humans.sort(HumanComparer);
Deno.writeTextFileSync("./notes/dump.json", JSON.stringify(humans));

humans.forEach((k, i) => console.log(`${i + 1}: ${k.toLongString()}`));
console.log("DONE");

await saveScvFiles(solution);
console.log("CSV files created");

function HumanComparer(a: WikiHuman, b: WikiHuman): number {
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
