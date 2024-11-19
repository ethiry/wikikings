// start from the last King (Louis-Philippe Q7771)
// add his predecessor
// if none, search among the siblings
// repeat
// stop at Huges capet (Q159575)
// the result contains only Kings and Kings' fathers line

import { ItemId, WikimediaLanguageCode } from "npm:wikibase-sdk";
import { getWikiObject } from "../wikidata.ts";
import { WikiHuman } from "../models/wikiHuman.ts";
import { ScenarioBase } from "./scenarioBase.ts";

export class Scenario1 extends ScenarioBase{
  constructor(language: WikimediaLanguageCode) {
    super(language);
  };

  private startId: ItemId = 'Q7771'; // Louis-Philippe
  private endId: ItemId = 'Q159575'; // Huges Capet

  private async getHuman(id: ItemId | undefined): Promise<WikiHuman | undefined> {
    if (id) {
      const wiki = await getWikiObject(id, this.language);
      if (wiki && wiki instanceof WikiHuman) {
        return wiki;
      }
    }
    return undefined;
  }

  private Solution = new Map<ItemId, WikiHuman>();

  protected override mustStop(id: ItemId): boolean {
    return (id === this.endId);
  }

  private getIdFromInput(input: ItemId | WikiHuman): ItemId {
    return input instanceof WikiHuman ? input.id : input;
  }

  private async getHumanFromInput(input: ItemId | WikiHuman): Promise<WikiHuman | undefined> {
    return input instanceof WikiHuman ? input : await this.getHuman(input);
  }

  private async browse(input: ItemId | WikiHuman | undefined, forceAdd: boolean) {
    if (!input) {
      console.log('browse null');
      return;
    }
    const logEntry = input instanceof WikiHuman ? 'browse ' + input.toString() : 'browse ' + input;
    console.log("start " + logEntry);

    const id = this.getIdFromInput(input);
    if (this.Solution.has(id)) {
      return;
    }
    const wiki = await this.getHumanFromInput(input);
    if (wiki) {
      console.log(`Found ${wiki.toString()}`);
      if (wiki.isKing || forceAdd) {
        if (!this.Solution.has(wiki.id)) {
          this.Solution.set(wiki.id, wiki);
        }
      }
      if (this.mustStop(wiki.id)) {
        console.log("must stop " + logEntry);
        return;
      }

      // predecessors
      const predecessors = wiki.positions?.filter(p => p.isKing && p.replaces) ?? [];
      if (predecessors.length) {
        for (const pred of predecessors ?? []) {
          if (pred.replaces) {
            await this.browse(pred.replaces, false);
          }
        }
      } else {
        // sibling king
        for (const id of wiki?.siblingsId ?? []) {
          const sib = await this.getHuman(id);
          if (sib instanceof WikiHuman && sib.isKing) {
            await this.browse(sib, false);
          }
        }
      }

      // father
      await this.browse(wiki.fatherId, true);
    }
    console.log("end " + logEntry);
  }
  
  public async run(): Promise<Map<ItemId, WikiHuman>> {
    await this.browse(this.startId, false);
    return this.Solution;
  }
}
