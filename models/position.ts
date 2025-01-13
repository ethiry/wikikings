import { ItemId, Qualifiers } from "npm:wikibase-sdk";
import { QualifierId } from "@/common/enums.ts";
import { WikiData } from "@/tools/wikiDataClass.ts";
import { TimeBasedStatement } from "./timeBasedStatement.ts";
import { CsvLine } from "@/tools/export.ts";

type KingDomain = "France" | "Britain" | "Iberico" | "ÖsterUnga" | "Polska";
const KingPositions = new Map<ItemId, KingDomain>([
  ["Q22923081", "France"],
  ["Q18384454", "France"],
  ["Q3439798", "France"],
  ["Q3439814", "France"],
  ["Q9134365", "Britain"],
  ["Q111722535", "Britain"],
  ["Q110324075", "Britain"],
  ["Q18810066", "Britain"],
  ["Q18810063", "Britain"],
  ["Q18810062", "Britain"],
  ["Q3847454", "Iberico"],
  ["Q58631963", "Iberico"],
  ["Q58005590", "Iberico"],
  ["Q58800860", "Iberico"],
  ["Q181765", "ÖsterUnga"],
  ["Q6412254", "ÖsterUnga"],
  ["Q45341328", "ÖsterUnga"],
  ["Q166877", "ÖsterUnga"],
  ["Q3273712", "Polska"],
]);

/*
depending on time frame:
Britain: England, Ireland, Scotland, United-Kingdom
France: Roi des Francs, Roi de France, Roi de France et de Navarre, Roi des Français
Iberico: Aragon, Castille, Spain
ÖsterUnga: Austria, Bohême, Hongrie, Austria-Hungary
Polska: Poland
*/

export class Position extends TimeBasedStatement {
  public label: string;
  public replaces?: ItemId;
  public replacedBy?: ItemId;
  public isKing = false;
  public kingDomain?: KingDomain;

  public constructor(id: ItemId, label: string, qualifiers: Qualifiers) {
    super(id, qualifiers);
    this.label = label;
    this.replaces = WikiData.getItemQualifier(QualifierId.Replaces, qualifiers);
    this.replacedBy = WikiData.getItemQualifier(QualifierId.ReplacedBy, qualifiers);
    if (KingPositions.has(id)) {
      this.isKing = true;
      this.kingDomain = KingPositions.get(id);
    }
  }

  public static get csvHeaderLine(): string[] {
    return ["positionId", "label", "isKing", "domain"];
  }

  public get csvLine(): CsvLine {
    return [this.id, this.label, this.isKing, this.kingDomain ?? ""];
  }
}
