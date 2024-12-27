import { WikiObject } from "@/models/wikiObject.ts";
import { WikiUtils } from "@/tools/wikiUtils.ts";
import { QualifierId } from "@/common/enums.ts";
import { ItemId, Qualifiers } from "npm:wikibase-sdk";

export abstract class TimeBasedStatement {
  public wiki: WikiObject;
  public start?: Date;
  public end?: Date;

  public constructor(wiki: WikiObject, qualifiers: Qualifiers) {
    this.wiki = wiki;
    this.start = WikiUtils.getDateQualifier(QualifierId.StartTime, qualifiers);
    this.end = WikiUtils.getDateQualifier(QualifierId.EndTime, qualifiers);
  }

  public get id(): ItemId {
    return this.wiki.id;
  }

  public get label(): string {
    return this.wiki.label;
  }
}
