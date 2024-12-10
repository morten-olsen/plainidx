import { Document } from '../documents/documents.document.js';
import { Documents } from '../documents/documents.js';
import { Databases } from '../databases/databases.js';
import { Plugin, PluginConstructor } from './plugin/plugin.js';
import { z, ZodSchema } from 'zod';

type PluginsOptions = {
  documents: Documents;
  databases: Databases;
};

class Plugins {
  #options: PluginsOptions;
  #plugins: Map<PluginConstructor, Plugin>;

  constructor(options: PluginsOptions) {
    this.#options = options;
    this.#plugins = new Map();
    options.documents.on('save', this.#onSave);
  }

  #onSave = async (document: Document) => {
    for (const plugin of this.#plugins.values()) {
      await plugin.process?.(document);
    }
  };

  #load = async (plugins: Plugin[]) => {
    await Promise.all(plugins.map((plugin) => plugin.onLoad?.()));
    plugins.forEach((plugin) => plugin.onLoaded?.());
  };

  #saveConfig = async (plugin: Plugin) => {
    const document = await this.#options.documents.get(`.db/plugins/${plugin.name}/config.json`);
    document.data = Buffer.from(JSON.stringify(plugin.configs));
    await document.save();
  };

  public get = async <T extends Plugin>(plugin: PluginConstructor<any, any, T>): Promise<T> => {
    if (!this.#plugins.has(plugin)) {
      await this.add([plugin]);
    }
    return this.#plugins.get(plugin) as T;
  };

  public add = async (plugins: PluginConstructor[]) => {
    const { documents, databases } = this.#options;
    const configs = await Promise.all(
      plugins.map(async (plugin) => {
        const document = await documents.get(`.db/plugins/${plugin.name}/config.json`);
        return JSON.parse(document.data.toString() || '{}');
      }),
    );
    const instances = plugins.map(
      (Plugin, i) =>
        new Plugin({
          plugins: this,
          documents,
          databases,
          configs: configs[i],
        }),
    );
    await this.#load(instances);
    for (let i = 0; i < plugins.length; i++) {
      const instance = instances[i];
      const plugin = plugins[i];
      instance.on('configChange', this.#saveConfig.bind(null, instance));
      this.#plugins.set(plugin, instance);
    }
  };

  public process = async (document: Document) => {
    for (const plugin of this.#plugins.values()) {
      await plugin.process?.(document);
    }
  };

  public unload = async () => {
    await Promise.all(this.#plugins.values().map((plugin) => plugin.onUnload?.()));
    this.#plugins = new Map();
  };

  public action = async <TPlugin extends Plugin<any, any, any>, TAction extends keyof TPlugin['actions']>(
    plugin: new (...args: any[]) => TPlugin,
    action: TAction,
    input: Exclude<Exclude<TPlugin['actions'], undefined>[TAction]['input'], undefined> extends ZodSchema
      ? z.infer<Exclude<Exclude<TPlugin['actions'], undefined>[TAction]['input'], undefined>>
      : undefined,
  ): Promise<
    Exclude<Exclude<TPlugin['actions'], undefined>[TAction]['output'], undefined> extends ZodSchema
      ? z.infer<Exclude<Exclude<TPlugin['actions'], undefined>[TAction]['output'], undefined>>
      : undefined
  > => {
    const instance = await this.get(plugin);
    const { actions } = instance;
    if (!actions) {
      throw new Error(`Plugin ${plugin.name} does not have actions`);
    }
    const actionDef = actions[action];
    if (!actionDef) {
      throw new Error(`Plugin ${plugin.name} does not have action ${String(action)}`);
    }
    actionDef.input?.parse(input);
    return actionDef.handle?.(input) as any;
  };
}

export { Plugins };
