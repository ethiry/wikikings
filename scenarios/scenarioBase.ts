import { ItemId, WikimediaLanguageCode } from "npm:wikibase-sdk";
import { WikiHuman } from "@/models/wikiHuman.ts";
import { WikiData } from "@/tools/wikiData.ts";

export class ContinuationData {
  public with: ItemId | WikiHuman;
  public forceAdd: boolean;

  public constructor(id: ItemId | WikiHuman, force?: boolean) {
    this.with = id;
    this.forceAdd = force ?? false;
  }

  public get id(): ItemId {
    return this.with instanceof WikiHuman ? this.with.id : this.with;
  }
}
export abstract class ScenarioBase {
  private language: WikimediaLanguageCode;
  private Solution = new Map<ItemId, WikiHuman>();
  public maxDepth = 0;
  private maxDepthLimit: number | undefined;

  constructor(language: WikimediaLanguageCode, depthLimit?: number) {
    this.language = language;
    this.maxDepthLimit = depthLimit ?? this.defaultDepthLimt;
  }

  protected get defaultDepthLimt(): number | undefined {
    return 5;
  }

  //#region the algorithm

  public async run(): Promise<Map<ItemId, WikiHuman>> {
    for (const data of this.startData()) {
      await this.browse(data, 0);
    }
    return this.Solution;
  }

  private async browse(input: ContinuationData, level: number): Promise<void> {
    if (!input) {
      console.log("browse null");
      return;
    }
    const logEntry = `[${level.toString().padStart(2, "0")}] ${input.id}`;
    console.log(logEntry + " start");
    if (this.maxDepthLimit && level > this.maxDepthLimit) {
      console.log(logEntry + " ABORTED: max depth reached");
      return;
    }
    this.maxDepth = Math.max(this.maxDepth, level);

    const id = this.getIdFromInput(input.with);
    if (this.Solution.has(id)) {
      console.log(logEntry + " already in solution");
      return;
    }
    const wiki = await this.getHumanFromInput(input.with);
    if (wiki) {
      // add to solution
      const added = this.addToSolutionIfneeded(wiki, input.forceAdd);
      console.log(`Found ${wiki.toString()} added: ${added}`);

      // stop condition
      if (this.mustStop(wiki)) {
        console.log(logEntry + " stop condition");
        return;
      }

      // browse continuation
      if (this.maxDepthLimit && level >= this.maxDepthLimit) {
        console.log(logEntry + " max depth reached, no continuation");
      } else {
        const continuationList = await this.continuationList(wiki);
        console.log(
          logEntry + " continue with " + continuationList.length + " items " +
            continuationList.map((c) => c.id).join(","),
        );
        for (const data of continuationList) {
          await this.browse(data, level + 1);
        }
      }
    }
    console.log(logEntry + " end");
  }

  private addToSolutionIfneeded(wiki: WikiHuman, force: boolean): boolean {
    if (!this.Solution.has(wiki.id) && (force || this.mustAdd(wiki))) {
      this.Solution.set(wiki.id, wiki);
      return true;
    }
    return false;
  }

  //#endregion

  //#region specific functions, to be overridden
  protected abstract startData(): ContinuationData[];
  protected abstract mustAdd(wiki: WikiHuman): boolean;
  protected abstract mustStop(input: WikiHuman): boolean;
  protected abstract continuationList(wiki: WikiHuman): Promise<ContinuationData[]>;
  //#endregion

  //#region common util functions

  protected async getHuman(id: ItemId | undefined): Promise<WikiHuman | undefined> {
    if (id) {
      const wiki = await WikiData.getWikiObject(id, this.language);
      if (wiki && wiki instanceof WikiHuman) {
        return wiki;
      }
    }
    return undefined;
  }

  protected getIdFromInput(input: ItemId | WikiHuman): ItemId {
    return input instanceof WikiHuman ? input.id : input;
  }

  protected async getHumanFromInput(input: ItemId | WikiHuman): Promise<WikiHuman | undefined> {
    return input instanceof WikiHuman ? input : await this.getHuman(input);
  }

  //#endregion
}
