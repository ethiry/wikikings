import { WikiData } from "@/tools/wikiDataClass.ts";
import { isItemId } from "npm:wikibase-sdk";
import { constants, copyFileSync } from "node:fs";

for await (const dirEntry of Deno.readDir("./wikidata")) {
  const s = dirEntry.name.split(".");
  const id = s[0];
  if (isItemId(id) && s[1] === "json") {
    const target = WikiData.entityCacheFile(id);
    console.log(dirEntry.name, "to", target);
    copyFileSync(`./wikidata/${dirEntry.name}`, target, constants.COPYFILE_FICLONE);
  }
}
