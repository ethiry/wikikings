import { isItemId, ItemId, WikimediaLanguageCode } from "npm:wikibase-sdk";
import { WikiHuman } from "@/models/wikiHuman.ts";
import { WikiData } from "@/tools/wikiDataClass.ts";
import { Queue } from "@/tools/queue.ts";
import { Export } from "@/tools/export.ts";
import { Config } from "@/tools/config.ts";

let startId: ItemId = "Q7742";
let levelMax = 4;
const language: WikimediaLanguageCode = "fr";

if (Deno.args.length > 0) {
  if (isItemId(Deno.args[0])) {
    startId = Deno.args[0];
  } else {
    throw new Error(`${Deno.args[0]} is Invalid ItemId`);
  }
}

if (Deno.args.length > 1) {
  levelMax = parseInt(Deno.args[1], 10);
  if (isNaN(levelMax)) {
    throw new Error(`${Deno.args[1]} is invalid levelMax`);
  }
}

const q = new Queue<ItemId>();

console.log("Start the queue ");
setTimeout(queueManager, 100);
console.log("Queue started");

q.enqueue(startId, levelMax);

// alert("Queue is running");
console.log("DONE");

async function queueManager(): Promise<void> {
  const solution = new Map<ItemId, WikiHuman>();
  let cpt = 0;
  while (true) {
    cpt++;
    console.log(`${q.info()};cpt=${cpt};${Math.trunc(Deno.memoryUsage().heapUsed / 1024 / 1024)}M`);
    // console.log(`Queue size: ${q.size}`);
    if (cpt % 1000 === 0) {
      console.log("Timestamp", new Date().toISOString());
    }
    const qi = q.dequeue();
    if (qi) {
      const wiki = await WikiData.getWikiObject(qi.data, language);
      if (wiki instanceof WikiHuman) {
        if (!wiki.ignore && !solution.has(wiki.id)) {
          solution.set(wiki.id, wiki);
        }
        const { priority, regular } = await wiki.continuationList();
        console.log(
          `${wiki.toString()} <${
            wiki.fromCache ? "cache" : "web"
          }> (${qi.level}) with ${priority.length}+${regular.length} continuation`,
        );
        q.enqueueAll(priority, regular, qi.level);
      } else {
        console.log(`${qi.data} is not a human`);
      }
    } else {
      cpt++;
      console.log("Queue is empty");
      const exporter = new Export(`${Config.outputFolder}/${startId}/${levelMax}`, solution);
      exporter.saveScvFiles();
      logSomeStats(solution);
      return;
    }
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function logSomeStats(solution: Map<ItemId, WikiHuman>) {
  const humans = Array.from(solution.values());
  const kings = humans.filter((l) => l.isKing);

  console.log("DONE");
  console.log(`Humans   : ${solution.size}`);
  console.log(`Kings    : ${kings.length}`);
}
