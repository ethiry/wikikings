// import { isEntityId, ItemId  } from "npm:wikibase-sdk";
// import { getWikiObject  } from "./wikidata.ts";
// import { WikiHuman } from "./models/wikiHuman.ts";
// import { WikiObject } from "./models/wikiObject.ts";
import { saveScvFiles } from "@/tools/export.ts";
import { WikiHuman } from "@/models/wikiHuman.ts";
import { Scenario1 } from "@/scenarios/scenario1.ts";

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

humans.sort(WikiHuman.comparer);
Deno.writeTextFileSync("./notes/dump.json", JSON.stringify(humans));

humans.forEach((k, i) => console.log(`${i + 1}: ${k.toLongString()}`));
console.log("DONE");

await saveScvFiles(solution);
console.log("CSV files created");
