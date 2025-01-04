import { ItemId, WikimediaLanguageCode } from "npm:wikibase-sdk";
import { WikiHuman } from "@/models/wikiHuman.ts";
import { ContinuationData, ScenarioBase } from "./scenarioBase.ts";
import { WikiData } from "@/tools/wikiDataClass.ts";

export class Scenario2 extends ScenarioBase {
  constructor(language: WikimediaLanguageCode, depthLimit?: number) {
    super(language, depthLimit);
  }

  protected override get defaultDepthLimt(): number | undefined {
    return 10;
  }

  private startId: ItemId = "Q7742"; // Louis XIV

  protected override startData(): ContinuationData[] {
    return [new ContinuationData(this.startId)];
  }

  protected override mustAdd(wiki: WikiHuman): boolean {
    return true;
  }

  protected override mustStop(input: WikiHuman): boolean {
    if (input.isKing) {
      return false;
    }
    if (input.ignore) {
      return true;
    }
    if (input.born) {
      return input.born.getFullYear() < 900;
    }
    return true;
  }

  protected override async continuationList(wiki: WikiHuman): Promise<ContinuationData[]> {
    const result: ContinuationData[] = [];

    // father && mother
    if (wiki.fatherId) {
      result.push(new ContinuationData(wiki.fatherId));
    }
    if (wiki.motherId) {
      result.push(new ContinuationData(wiki.motherId));
    }

    // siblings
    if (wiki.siblingsId) {
      result.push(...wiki.siblingsId.map((id) => new ContinuationData(id)));
    }

    // spouses
    if (wiki.spouses) {
      result.push(...wiki.spouses.map((spouse) => new ContinuationData(spouse.id)));
    }

    // children
    if (wiki.childrenId) {
      result.push(...wiki.childrenId.map((id) => new ContinuationData(id)));
    }

    // predecessors
    wiki.reigns.filter((r) => r.replaces).forEach((pred) => {
      if (pred.replaces && result.filter((r) => r.id === pred.replaces).length === 0) {
        result.push(new ContinuationData(pred.replaces));
      }
    });

    // successors
    wiki.reigns.filter((r) => r.replacedBy).forEach((succ) => {
      if (succ.replacedBy && result.filter((r) => r.id === succ.replacedBy).length === 0) {
        result.push(new ContinuationData(succ.replacedBy));
      }
    });

    return result;
  }
}
