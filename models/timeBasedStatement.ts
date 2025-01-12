import { WikiObject } from "@/models/wikiObject.ts";
import { WikiData } from "../tools/wikiDataClass.ts";
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

  public get durationInYears(): number {
    if (!this.start || !this.end) {
      return 0;
    }
    const startTime = this.start.getTime();
    const endTime = this.end.getTime();
    const millisecondsInYear = 1000 * 60 * 60 * 24 * 365.25;
    return (endTime - startTime) / millisecondsInYear;
  }
}
