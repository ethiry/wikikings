import { Export } from "@/tools/export.ts";
import { Scenario1 } from "@/scenarios/scenario1.ts";
import { Scenario2 } from "@/scenarios/scenario2.ts";
import { Config } from "@/tools/config.ts";
import { ItemId } from "npm:wikibase-sdk";
import { WikiHuman } from "@/models/wikiHuman.ts";

let maxDepth: number | undefined;

if (Deno.args.length > 0) {
  const arg0 = parseInt(Deno.args[0], 10);
  if (!isNaN(arg0)) {
    maxDepth = arg0;
  }
}

console.log("Start", new Date().toISOString());
const scenario = new Scenario2("fr", maxDepth);
const solution = await scenario.run();
console.log("Done", new Date().toISOString());

const exporter = new Export(Config.outputFolder, solution);
exporter.saveScvFiles();

console.log("CSV files created");
console.log("end", new Date().toISOString());

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
