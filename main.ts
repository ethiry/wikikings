import { Export } from "@/tools/export.ts";
import { Scenario1 } from "@/scenarios/scenario1.ts";
import { Config } from "@/tools/config.ts";
import { ItemId } from "npm:wikibase-sdk";
import { WikiHuman } from "@/models/wikiHuman.ts";

const scenario = new Scenario1("fr");
const solution = await scenario.run();

const exporter = new Export(Config.outputFolder, solution);
exporter.saveScvFiles();

console.log("CSV files created");

logSomeStats(solution);

function logSomeStats(solution: Map<ItemId, WikiHuman>) {
  const humans = Array.from(solution.values());
  const kings = humans.filter((l) => l.isKing);

  humans.sort(WikiHuman.comparer);
  Deno.writeTextFileSync("./notes/dump.json", JSON.stringify(humans));

  console.log("DONE");
  console.log(`Humans   : ${solution.size}`);
  console.log(`Kings    : ${kings.length}`);
  console.log(`Depth Max: ${scenario.maxDepth}`);
}
