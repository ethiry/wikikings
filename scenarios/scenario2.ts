import { ItemId, WikimediaLanguageCode } from "npm:wikibase-sdk";
import { WikiHuman } from "@/models/wikiHuman.ts";
import { ContinuationData, ScenarioBase } from "./scenarioBase.ts";

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
    if (input.born) {
      return input.born.isBefore("0900-01-01");
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
    for (const id of wiki?.siblingsId ?? []) {
      const sib = await this.getHuman(id);
      if (sib instanceof WikiHuman && sib.age && sib.age >= 10) {
        result.push(new ContinuationData(sib));
      }
    }

    // spouses
    for (const spouse of wiki?.spouses ?? []) {
      if (spouse.wiki instanceof WikiHuman) {
        result.push(new ContinuationData(spouse.wiki));
      }
    }

    // children
    for (const id of wiki?.childrenId ?? []) {
      const child = await this.getHuman(id);
      if (child instanceof WikiHuman && child.age && child.age >= 10) {
        result.push(new ContinuationData(child));
      }
    }

    // predecessors
    const predecessors = wiki.positions?.filter((p) => p.isKing && p.replaces) ?? [];
    for (const pred of predecessors ?? []) {
      if (pred.replaces && result.filter((r) => r.id === pred.replaces).length === 0) {
        result.push(new ContinuationData(pred.replaces));
      }
    }

    // successors
    const successors = wiki.positions?.filter((p) => p.isKing && p.replacedBy) ?? [];
    for (const succ of successors ?? []) {
      if (succ.replacedBy && result.filter((r) => r.id === succ.replacedBy).length === 0) {
        result.push(new ContinuationData(succ.replacedBy));
      }
    }

    return result;
  }
}
