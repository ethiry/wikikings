export class Config {
  private static _cacheFolder: string;
  private static _outputFolder: string;

  private static readConfig() {
    const config = JSON.parse(Deno.readTextFileSync("./config.json"));

    if (!config.cacheFolder) {
      throw new Deno.errors.InvalidData('field "cacheFolder" in missing from config.file');
    }
    this._cacheFolder = config.cacheFolder;
    if (!config.outputFolder) {
      throw new Deno.errors.InvalidData('field "outputFolder" in missing from config.file');
    }
    this._outputFolder = config.outputFolder;
  }

  public static get cacheFolder(): string {
    if (!this._cacheFolder) {
      this.readConfig();
    }
    return this._cacheFolder;
  }

  public static get outputFolder(): string {
    if (!this._outputFolder) {
      this.readConfig();
    }
    return this._outputFolder;
  }
}
