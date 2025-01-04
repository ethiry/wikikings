import { WikiObject } from "@/models/wikiObject.ts";
import { WikiData } from "../tools/wikiData.ts";
import { QualifierId } from "@/common/enums.ts";
import { ItemId, Qualifiers } from "npm:wikibase-sdk";

export abstract class TimeBasedStatement {
  public id: ItemId;
  public start?: Date;
  public end?: Date;

  public constructor(id: ItemId, qualifiers: Qualifiers) {
    this.id = id;
    this.start = WikiData.getDateQualifier(QualifierId.StartTime, qualifiers);
    this.end = WikiData.getDateQualifier(QualifierId.EndTime, qualifiers);
  }
}
