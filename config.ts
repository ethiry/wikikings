export class Config {
  private static _outputFolder: string;

  private static readConfig() {
    const config = JSON.parse(Deno.readTextFileSync("./config.json"));

    if (!config.outputFolder) {
      throw new Deno.errors.InvalidData(
        'field "outputFolder" in missing from config.file'
      );
    }
    this._outputFolder = config.outputFolder;
  }

  public static get outputFolder(): string {
    if (!this._outputFolder) {
      this.readConfig();
    }
    return this._outputFolder;
  }
}
