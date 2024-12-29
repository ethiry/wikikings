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
}
export abstract class ScenarioBase {
  private language: WikimediaLanguageCode;
  private Solution = new Map<ItemId, WikiHuman>();
  public maxDepth = 0;

  constructor(language: WikimediaLanguageCode) {
    this.language = language;
  }

  //#region the algorithm

  public async run(): Promise<Map<ItemId, WikiHuman>> {
    for (const data of this.startData()) {
      await this.browse(data, 0);
    }
    return this.Solution;
  }

  private async browse(input: ContinuationData, depth: number): Promise<void> {
    if (!input) {
      console.log("browse null");
      return;
    }
    const logEntry = input.with instanceof WikiHuman ? input.with.toString() : "browse " + input.with + " " + depth;
    console.log("start " + logEntry);
    this.maxDepth = Math.max(this.maxDepth, depth);

    const id = this.getIdFromInput(input.with);
    if (this.Solution.has(id)) {
      return;
    }
    const wiki = await this.getHumanFromInput(input.with);
    if (wiki) {
      console.log(`Found ${wiki.toString()}`);

      // add to solution
      this.addToSolutionIfneeded(wiki, input.forceAdd);

      // stop condition
      if (this.mustStop(wiki)) {
        return;
      }

      // browse continuation
      for (const data of await this.continuationList(wiki)) {
        await this.browse(data, depth + 1);
      }
    }
    console.log("end " + logEntry);
  }

  private addToSolutionIfneeded(wiki: WikiHuman, force: boolean) {
    if (!this.Solution.has(wiki.id) && (force || this.mustAdd(wiki))) {
      this.Solution.set(wiki.id, wiki);
    }
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
