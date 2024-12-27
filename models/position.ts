import { ItemId, Qualifiers } from "npm:wikibase-sdk";
import { QualifierId } from "@/common/enums.ts";
import { WikiUtils } from "@/tools/wikiUtils.ts";
import { WikiObject } from "./wikiObject.ts";
import { TimeBasedStatement } from "./timeBasedStatement.ts";

export class Position extends TimeBasedStatement {
  public replaces?: ItemId;
  public replacedBy?: ItemId;
  public isKing: boolean;

  public constructor(wiki: WikiObject, qualifiers: Qualifiers) {
    super(wiki, qualifiers);
    this.replaces = WikiUtils.getItemQualifier(QualifierId.Replaces, qualifiers);
    this.replacedBy = WikiUtils.getItemQualifier(QualifierId.ReplacedBy, qualifiers);
    this.isKing = Position.kingsPositions.includes(wiki.id);
  }

  public static get csvHeaderLine(): string {
    return "positionId,label";
  }

  public get csvLine(): string {
    return `${this.id},"${this.label}"`;
  }

  private static kingsPositions = ["Q22923081", "Q18384454", "Q3439798", "Q3439814"];
}
