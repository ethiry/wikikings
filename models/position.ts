import { ItemId, Qualifiers } from "npm:wikibase-sdk";
import { QualifierId } from "@/common/enums.ts";
import { WikiData } from "@/tools/wikiDataClass.ts";
import { TimeBasedStatement } from "./timeBasedStatement.ts";
import { CsvLine } from "@/tools/export.ts";

type KingDomain = "France" | "United Kingdom" | "España" | "AutricheHongrie" | "Pologne";
const KingPositions = new Map<ItemId, KingDomain>([
  ["Q22923081", "France"],
  ["Q18384454", "France"],
  ["Q3439798", "France"],
  ["Q3439814", "France"],
  ["Q9134365", "United Kingdom"],
  ["Q111722535", "United Kingdom"],
  ["Q110324075", "United Kingdom"],
  ["Q18810066", "United Kingdom"],
  ["Q18810063", "United Kingdom"],
  ["Q18810062", "United Kingdom"],
  ["Q3847454", "España"],
  ["Q58631963", "España"],
  ["Q58005590", "España"],
  ["Q58800860", "España"],
  ["Q181765", "AutricheHongrie"],
  ["Q6412254", "AutricheHongrie"],
  ["Q45341328", "AutricheHongrie"],
  ["Q166877", "AutricheHongrie"],
  ["Q3273712", "Pologne"],
]);
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
