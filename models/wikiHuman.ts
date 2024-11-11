import { 
  Item, 
  ItemId, 
  WikimediaLanguageCode,
} from "npm:wikibase-sdk";
import { StatementId } from "./enums.ts";
import { Position } from "./position.ts";
import { WikiObject } from "./wikiObject.ts";

export class WikiHuman extends WikiObject {
  constructor(item: Item, language: WikimediaLanguageCode) {
    super(item, language);
  }

  private _fatherId: ItemId | undefined = undefined;
  private _siblings: ItemId[] | undefined = undefined;
  private _positions: Position[] | undefined = undefined;
  
  public get FatherId(): ItemId | undefined {
    if (!this._fatherId) {
      this._fatherId = this.getStatement(StatementId.Father);
    }
    return this._fatherId;
  }

  public get Positions(): Position[] {
    if (!this._positions) {
      this._positions = Position.Factory(this.Item);
    }
    return this._positions ?? [];
  }

  public get Siblings(): ItemId[] {
    if (!this._siblings) {
      this._siblings = this.getStatements(StatementId.Sibling);
    }
    return this._siblings;
  }
}
