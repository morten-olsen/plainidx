import { Document, Documents } from '../../documents/documents.js';
import { DatabaseMigration, Databases } from '../../databases/databases.js';
import { EventEmitter } from '../../utils/eventemitter.js';
import { Plugins } from '../plugins.js';
import { z, ZodSchema } from 'zod';
import { PluginActionApi } from './plugin.api.js';
import { Editor } from '../../editor/editor.js';

type PluginOptions<TLocalConfig extends ZodSchema = ZodSchema, TSharedConfig extends ZodSchema = ZodSchema> = {
  plugins: Plugins;
  documents: Documents;
  databases: Databases;
  configs: {
    local?: TLocalConfig;
    shared?: TSharedConfig;
  };
};

type PluginEvents = {
  configChange: (config: unknown) => void;
};

abstract class Plugin<
  TLocalConfig extends ZodSchema = ZodSchema,
  TSharedConfig extends ZodSchema = ZodSchema,
  TActions extends PluginActionApi = PluginActionApi,
> extends EventEmitter<PluginEvents> {
  #options: PluginOptions<TLocalConfig, TSharedConfig>;

  constructor(options: PluginOptions<TLocalConfig, TSharedConfig>) {
    super();
    this.#options = options;
  }

  public get documents(): Documents {
    return this.#options.documents;
  }

  public readonly configSchemas?: {
    local?: TLocalConfig;
    shared?: TSharedConfig;
  };

  public getDB = async (name: string, migrations: DatabaseMigration[]) => {
    const { databases } = this.#options;
    const scopedName = `plugins:${this.name}:${name}`;
    return databases.get({ name: scopedName, migrations });
  };

  public get configs(): {
    local?: z.infer<TLocalConfig>;
    shared?: z.infer<TSharedConfig>;
  } {
    return this.#options.configs;
  }

  public setConfigs = async (configs: { local?: z.infer<TLocalConfig>; shared?: z.infer<TSharedConfig> }) => {
    this.#options.configs = configs;
    await this.emit('configChange', configs);
  };

  public abstract readonly name: string;
  public actions?: TActions;
  public onLoad?: () => Promise<void>;
  public onUnload?: () => Promise<void>;
  public onLoaded?: () => Promise<void>;
  public process?: (document: Document) => Promise<void>;
  public setupUI?: (editor: Editor) => Promise<void>;

  /*public getPlugin = async <T extends Plugin>(plugin: new (...args: any) => T): Promise<
    T['api'] extends (...args: any[]) => infer R ? R : never
  > => {
    const { plugins } = this.#options;
    const instance = await plugins.get(plugin);
    return instance.api?.() as any;
  }*/

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
    const { plugins } = this.#options;
    const instance = await plugins.get(plugin);
    const { actions } = instance;
    if (!actions) {
      throw new Error(`Plugin ${plugin.name} does not have actions`);
    }
    const actionDef = actions[action];
    if (!actionDef) {
      throw new Error(`Plugin ${plugin.name} does not have action ${String(action)}`);
    }
    actionDef.input?.parse(input);
    return (await actionDef.handle?.(input)) as any;
  };
}

type PluginConstructor<
  TLocalConfig extends ZodSchema = ZodSchema,
  TSharedConfig extends ZodSchema = ZodSchema,
  T extends Plugin = Plugin,
> = new (options: PluginOptions<TLocalConfig, TSharedConfig>) => T;

export { Plugin, type PluginOptions, type PluginConstructor };
