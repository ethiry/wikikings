// start from the last King (Louis-Philippe Q7771)
// add his predecessor
// if none, search among the siblings
// repeat
// stop at Hugues capet (Q159575)
// the result contains only Kings and Kings' fathers line

import { ItemId, WikimediaLanguageCode } from "npm:wikibase-sdk";
import { WikiHuman } from "@/models/wikiHuman.ts";
import { ContinuationData, ScenarioBase } from "./scenarioBase.ts";

export class Scenario1 extends ScenarioBase {
  constructor(language: WikimediaLanguageCode) {
    super(language);
  }

  private startId: ItemId = "Q7771"; // Louis-Philippe
  private endId: ItemId = "Q159575"; // Huges Capet

  protected override startData(): ContinuationData[] {
    return [new ContinuationData(this.startId)];
  }

  protected override mustAdd(wiki: WikiHuman): boolean {
    return wiki.isKing;
  }

  protected override mustStop(input: WikiHuman): boolean {
    return (this.getIdFromInput(input) === this.endId);
  }

  protected override async continuationList(wiki: WikiHuman): Promise<ContinuationData[]> {
    const result: ContinuationData[] = [];

    // predecessors
    const predecessors = wiki.positions?.filter((p) => p.isKing && p.replaces) ?? [];
    if (predecessors.length) {
      for (const pred of predecessors ?? []) {
        if (pred.replaces) {
          result.push(new ContinuationData(pred.replaces));
        }
      }
    } else {
      // sibling king
      for (const id of wiki?.siblingsId ?? []) {
        const sib = await this.getHuman(id);
        if (sib instanceof WikiHuman && sib.isKing) {
          result.push(new ContinuationData(sib));
        }
      }
    }

    // father
    if (wiki.fatherId) {
      result.push(new ContinuationData(wiki.fatherId, true));
    }

    return result;
  }
}
