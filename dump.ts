import { isItemId, ItemId, WikimediaLanguageCode } from "npm:wikibase-sdk";
import { WikiHuman } from "@/models/wikiHuman.ts";
import { WikiData } from "@/tools/wikiData.ts";
import { Queue } from "@/tools/queue.ts";

let startId: ItemId = "Q7742";
const language: WikimediaLanguageCode = "fr";

if (Deno.args.length > 0) {
  if (isItemId(Deno.args[0])) {
    startId = Deno.args[0];
  } else {
    throw new Error(`${Deno.args[0]} is Invalid ItemId`);
  }
}

const q = new Queue<ItemId>();

console.log("Start the queue ");
setTimeout(queueManager, 100);
console.log("Queue started");

q.enqueue(startId);

// alert("Queue is running");
console.log("DONE");

async function queueManager(): Promise<void> {
  let cpt = 0;
  while (true) {
    cpt++;
    console.log(`${q.info()} cpt=${cpt} ${Math.trunc(Deno.memoryUsage().heapUsed / 1024 / 1024)}M`);
    // console.log(`Queue size: ${q.size}`);
    if (cpt % 1000 === 0) {
      console.log("Timestamp", new Date().toISOString());
    }
    const id = q.dequeue();
    if (id) {
      const wiki = await WikiData.getWikiObject(id, language);
      if (wiki instanceof WikiHuman) {
        const continuationList = await wiki.continuationList(language);
        const origin = wiki.fromCache ? "cache" : "web";
        console.log(`${wiki.toString()} [from ${origin}] with ${continuationList.length} continuation`);
        q.enqueueAll(continuationList);
      } else {
        console.log(`${id} is not a human`);
      }
    } else {
      cpt++;
      console.log("Queue is empty");
      await sleep(1000);
    }
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
