import { ItemId, Qualifiers } from "npm:wikibase-sdk";
import { QualifierId } from "@/common/enums.ts";
import { WikiData } from "@/tools/wikiDataClass.ts";
import { TimeBasedStatement } from "./timeBasedStatement.ts";
import { CsvLine } from "@/tools/export.ts";

export class Position extends TimeBasedStatement {
  public label: string;
  public replaces?: ItemId;
  public replacedBy?: ItemId;
  public isKing: boolean;

  public constructor(id: ItemId, label: string, qualifiers: Qualifiers) {
    super(id, qualifiers);
    this.label = label;
    this.replaces = WikiData.getItemQualifier(QualifierId.Replaces, qualifiers);
    this.replacedBy = WikiData.getItemQualifier(QualifierId.ReplacedBy, qualifiers);
    this.isKing = Position.kingsPositions.includes(id);
  }

  public static get csvHeaderLine(): string[] {
    return ["positionId", "label", "isKing"];
  }

  public get csvLine(): CsvLine {
    return [this.id, this.label, this.isKing];
  }

  private static kingsPositions = ["Q22923081", "Q18384454", "Q3439798", "Q3439814"]; // rois de France
}
