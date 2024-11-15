// start from the last King (Louis-Philippe Q7771)
// add his predecessor
// if none, search among the siblings
// repeat
// stop at Huges capet (Q159575)
// the result contains only Kings

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

  private mustStop(id: ItemId): boolean {
    return (id === this.endId);
  }

  private async browse(input: ItemId | WikiHuman | undefined, forceAdd = false) {
    if (!input) {
      console.log('browse null');
      return;
    }
    const logEntry = input instanceof WikiHuman ? 'browse ' + input.toString() : 'browse ' + input;
    console.log("start " + logEntry);
    const wiki = input instanceof WikiHuman ? input : await this.getHuman(input);
    if (wiki) {
      if (this.Solution.has(wiki.id)) {
        return;
      }
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
          if (pred.replaces && !this.Solution.has(pred.replaces)) {
            await this.browse(pred.replaces);
          }
        }
      } else {
        // sibling king
        for (const s of wiki?.siblingsId ?? []) {
          const sk = await this.getHuman(s);
          if (sk instanceof WikiHuman && sk.isKing && !this.Solution.has(sk.id)) {
            await this.browse(sk);
          }
        }
      }

      // father
      // const father = await this.getHuman(wiki.fatherId);
      // if (father) {
      //   await this.browse(father, true);
      // }      
    }
    console.log("end " + logEntry);
  }
  
  public async run(): Promise<Map<ItemId, WikiHuman>> {
    await this.browse(this.startId);
    return this.Solution;
  }
}
