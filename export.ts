import { ItemId } from "npm:wikibase-sdk";import { WikiHuman } from "./models/wikiHuman.ts";
import { formatDate } from "./common/utils.ts";
import dayjs from "https://deno.land/x/deno_dayjs@v0.5.0/mod.ts";

const folder = "/Users/manu/Library/Application\ Support/Neo4j\ Desktop/Application/relate-data/dbmss/dbms-a7a2dfde-c9d2-412b-b102-c312ad57ff6b/import";

async function writeLine(outputWriter: WritableStreamDefaultWriter<Uint8Array>, line: string) {
  const encoded = new TextEncoder().encode(line + "\n");
  await outputWriter.write(encoded);
}

async function saveCsvFile(filename: string, lines: string[], header?: string) {
  const output = await Deno.open(`${folder}/${filename}.csv`, {
    create: true,
    write: true,
    truncate: true,
  });
  const outputWriter = output.writable.getWriter();
  await outputWriter.ready;

  if (header) {
    await writeLine(outputWriter, header);
  }
  for (const line of lines) {
    await writeLine(outputWriter, line);
  }

  await outputWriter.close();
}



export async function saveScvFiles(solution: Map<ItemId, WikiHuman>) {
  const humans = Array.from(solution.values());

  // humans
  await saveCsvFile("humans", humans.map(h => h.csvLine), WikiHuman.csvHeaderLine);

  // parent-child relationships
  await saveCsvFile("parents",
                    humans.filter(h => h.fatherId)
                          .map(h => `${h.fatherId},${h.id}`),
                    "parentId,childId",);
  
  // siblings relationships
  const siblings = new Array<string>();
  for (const older of humans) {
    if (older.born && older.siblingsId) {
      for (const yid of older.siblingsId) {
        const younger = solution.get(yid);
        if (younger && younger.born && dayjs(older.born).isBefore(dayjs(younger.born))) {
          siblings.push(`${older.id},${younger.id}`);
        }
      };
    }
  }
  await saveCsvFile("siblings", siblings);


  // replaced_by relationships
  const replacedBy = new Array<string>();
  humans.forEach(h => {
    h.positions?.forEach(p => {
      if (p.isKing && p.end && p.replacedBy) {
        replacedBy.push(`${h.id},${p.label},${formatDate(p.end)},${p.replacedBy}`);
      }
    })
  });

  await saveCsvFile("replacedBy", replacedBy, "id,label,date,successorId");

  return;
}