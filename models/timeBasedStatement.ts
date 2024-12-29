import { WikiObject } from "@/models/wikiObject.ts";
import { WikiData } from "../tools/wikiData.ts";
import { QualifierId } from "@/common/enums.ts";
import { ItemId, Qualifiers } from "npm:wikibase-sdk";
import { Dayjs } from "dayjs";

export abstract class TimeBasedStatement {
  public wiki: WikiObject;
  public start?: Dayjs;
  public end?: Dayjs;

  public constructor(wiki: WikiObject, qualifiers: Qualifiers) {
    this.wiki = wiki;
    this.start = WikiData.getDateQualifier(QualifierId.StartTime, qualifiers);
    this.end = WikiData.getDateQualifier(QualifierId.EndTime, qualifiers);
  }

  public get id(): ItemId {
    return this.wiki.id;
  }

  public get label(): string {
    return this.wiki.label;
  }
}
