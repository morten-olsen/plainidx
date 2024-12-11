import { Manifest } from '@plainidx/base';
import { Plugin } from '../plugin/plugin.js';

type ClientOptions = {
  transport: unknown;
};

class Client {
  #options: ClientOptions;

  constructor(options: ClientOptions) {
    this.#options = options;
  }

  public getPlugin = <TManifest extends Manifest>(manifest: TManifest) => {
    return undefined as unknown as Plugin<TManifest>;
  };
}

export { Client };
