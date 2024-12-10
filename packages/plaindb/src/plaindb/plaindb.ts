import { Knex } from 'knex';
import { Documents } from '../documents/documents.js';
import { FileSystem } from '../filesystem/filesystem.js';
import { Plugins } from '../plugins/plugins.js';
import { Databases } from '../databases/databases.js';

type PlainDBOptions = {
  fs: FileSystem;
  getDBConfig: (name: string) => Knex.Config;
};

class PlainDB {
  #options: PlainDBOptions;
  #documents: Documents;
  #plugins: Plugins;
  #databases: Databases;

  constructor(options: PlainDBOptions) {
    this.#options = options;
    this.#databases = new Databases({
      getConfig: this.#options.getDBConfig,
    });
    this.#documents = new Documents({
      fs: this.#options.fs,
      databases: this.#databases,
    });
    this.#plugins = new Plugins({
      documents: this.#documents,
      databases: this.#databases,
    });
  }

  public get documents() {
    return this.#documents;
  }

  public get plugins() {
    return this.#plugins;
  }

  public get databases() {
    return this.#databases;
  }

  public close = async () => {
    await this.#databases.close();
  };
}

export { PlainDB };
