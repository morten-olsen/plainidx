import { Document } from '../documents/documents.document.js';
import { Documents } from '../documents/documents.js';
import { Databases } from '../databases/databases.js';
import { Plugin, PluginFactory } from './plugin/plugin.js';
import { Manifest } from '@plainidx/base';

type PluginsOptions = {
  documents: Documents;
  databases: Databases;
};

class Plugins {
  #options: PluginsOptions;
  #plugins: Map<string, Plugin<any>>;

  constructor(options: PluginsOptions) {
    this.#options = options;
    this.#plugins = new Map();
    options.documents.on('save', this.#onSave);
  }

  #onSave = async (document: Document) => {
    for (const plugin of this.#plugins.values()) {
      if (plugin.backend) {
        await plugin?.process?.(document);
      }
    }
  };

  public get = async <TManifest extends Manifest>(manifest: TManifest): Promise<Plugin<TManifest>> => {
    if (!this.#plugins.has(manifest.id)) {
      throw new Error(`Plugin ${manifest.id} is not loaded`);
    }
    return this.#plugins.get(manifest.id) as Plugin<TManifest>;
  };

  public add = async (plugins: PluginFactory<any>[]) => {
    const { documents, databases } = this.#options;
    const configs = await Promise.all(
      plugins.map(async (plugin) => {
        const document = await documents.get(`.db/plugins/${plugin.name}/config.json`);
        return JSON.parse(document.data.toString() || '{}');
      }),
    );
    const instances = await Promise.all(
      plugins.map(async (plugin, i) => {
        const instance = plugin({
          config: configs[i],
          documents,
          getPlugin: this.get,
          getDb: async (name, migrations) => {
            return databases.get({
              name: `plugins/${plugin.manifest.id}/${name}`,
              migrations,
            });
          },
        });
        return instance as Plugin<any>;
      }),
    );
    for (const instance of instances) {
      this.#plugins.set(instance.manifest.id, instance);
    }
    await Promise.all(
      instances.map(async (instance) => {
        if ('load' in instance) {
          await instance.load?.();
        }
      }),
    );
  };

  public process = async (document: Document) => {
    for (const plugin of this.#plugins.values()) {
      if (plugin.backend) {
        await plugin?.process?.(document);
      }
    }
  };

  public unload = async () => {
    await Promise.all(
      this.#plugins.values().map((plugin) => {
        if (plugin.backend) {
          return plugin.unload?.();
        }
      }),
    );
    this.#plugins = new Map();
  };
}

export { Plugins };
