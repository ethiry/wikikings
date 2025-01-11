import { isItemId, ItemId, WikimediaLanguageCode, wikimediaLanguageCodes } from "npm:wikibase-sdk";
import { WikiHuman } from "@/models/wikiHuman.ts";
import { WikiData } from "@/tools/wikiDataClass.ts";
import { Queue } from "@/tools/queue.ts";
import { Export } from "@/tools/export.ts";
import { Config } from "@/tools/config.ts";
import { parseArgs } from "@std/cli/parse-args";
import process from "node:process";

const options = getOptions();
console.log("Options", options);

const q = new Queue<ItemId>();

console.log("Start the queue ");
setTimeout(() => queueManager(options), 100);

console.log("Enqueue", options.startIds);
q.enqueueAll(options.startIds, [], options.levelMax);

// alert("Queue is running");
console.log("DONE");

async function queueManager(options: Options): Promise<void> {
  console.log("Queue started");
  const solution = new Map<ItemId, WikiHuman>();
  const startTime = new Date();
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
      const wiki = await WikiData.getWikiObject(qi.data, options.language);
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
      const endTime = new Date();
      console.log("Queue is empty");
      const exporter = new Export(options.outputFolder, solution);
      await exporter.saveScvFiles();
      const executionTime = getExecutionTime(startTime, endTime);
      console.log(`DONE in ${executionTime}`);
      const counters = `totalQueued=${q.alreadyQueued.size} cpt=${cpt}`;
      const stats = getSomeStats(solution);
      exporter.writeFile("report.txt", [counters, executionTime, stats]);
      console.log(stats);
      return;
    }
  }
}

function _sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function getExecutionTime(startTime: Date, endTime: Date): string {
  const executionTime = endTime.getTime() - startTime.getTime();
  const hours = Math.floor(executionTime / (1000 * 60 * 60));
  const minutes = Math.floor((executionTime % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((executionTime % (1000 * 60)) / 1000);
  return `Execution time: ${hours}h ${minutes}m ${seconds}s`;
}

function getSomeStats(solution: Map<ItemId, WikiHuman>): string {
  const humans = Array.from(solution.values());
  const kings = humans.filter((l) => l.isKing);
  const positionsPerDomain = humans.reduce((acc, human) => {
    human.reigns?.forEach((position) => {
      if (position.kingDomain) {
        if (!acc[position.kingDomain]) {
          acc[position.kingDomain] = 0;
        }
        acc[position.kingDomain]++;
      }
    });
    return acc;
  }, {} as Record<string, number>);

  return `Humans   : ${solution.size}
Kings    : ${kings.length}
Kings per domain: ${JSON.stringify(positionsPerDomain)}`;
}

type Options = {
  startIds: ItemId[];
  levelMax: number;
  language: WikimediaLanguageCode;
  outputFolder: string;
};

function getOptions(): Options {
  const options = parseArgs(Deno.args, {
    alias: {
      startId: "s",
      levelMax: "l",
      language: "L",
    },
    boolean: ["help"],
    string: ["startId", "levelMax", "language"],
    collect: ["startId"],
  });

  const result: Options = {
    startIds: ["Q7742"],
    levelMax: 4,
    language: "fr",
    outputFolder: "",
  };

  if (options.help) {
    console.log("Usage: dump.ts [options]");
    console.log("Options:");
    console.log(`  -s, --startId: start ItemId (default: ${result.startIds}) multiple possible`);
    console.log(`  -l, --levelMax: max level (default: ${result.levelMax})`);
    console.log(`  -L, --language: language (default: ${result.language})`);
    process.exit(1);
  }

  if (options.startId.length > 0) {
    const ids = options.startId.filter(isItemId);
    if (ids.length === 0) {
      console.error("Invalid startId(s)");
      process.exit(1);
    }
    result.startIds = ids;
  }
  if (options.levelMax) {
    const max = parseInt(options.levelMax, 10);
    if (isNaN(max)) {
      console.error("Invalid levelMax");
      process.exit(1);
    }
    result.levelMax = max;
  }
  if (options.language) {
    const lg = options.language as WikimediaLanguageCode;
    if (!wikimediaLanguageCodes.includes(lg)) {
      console.error("Invalid language");
      process.exit(1);
    }
    result.language = lg;
  }

  result.startIds.sort();
  result.outputFolder = `${Config.outputFolder}/${result.language}/${result.startIds.join("-")}/${result.levelMax}`;

  return result;
}
