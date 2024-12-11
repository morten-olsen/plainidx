import { z } from 'zod';
import { Document, Documents } from '../../documents/documents.js';
import { DatabaseMigration } from '../../databases/databases.js';
import { Knex } from 'knex';
import { Manifest, ManifestBackend } from '@plainidx/base';

type Plugin<TManifest extends Manifest> = TManifest['backend'] extends ManifestBackend
  ? {
    backend: true;
    manifest: TManifest;
    actions: {
      [TKey in keyof TManifest['backend']['actions']]: (
        input: z.infer<TManifest['backend']['actions'][TKey]['input']>,
      ) => Promise<z.infer<TManifest['backend']['actions'][TKey]['output']>>;
    };
    process?: (document: Document) => Promise<void>;
    load?: () => Promise<void>;
    unload?: () => Promise<void>;
  }
  : {
    backend: false;
    manifest: TManifest;
  };

type PluginFactoryOptions<TManifest extends Manifest> = {
  config: z.infer<TManifest['config']>;
  documents: Documents;
  getPlugin: <TManifest extends Manifest>(manifest: TManifest) => Promise<Plugin<TManifest>>;
  getDb: (name: string, migrations: DatabaseMigration[]) => Promise<Knex>;
};

type BackendPluginFactory<TManifest extends Manifest> = ((
  options: PluginFactoryOptions<TManifest>,
) => Plugin<TManifest>) & { manifest: TManifest };

const createPlugin = <TManifest extends Manifest>(
  manifest: TManifest,
  implementation: (options: PluginFactoryOptions<TManifest>) => Omit<Plugin<TManifest>, 'manifest' | 'backend'>,
): BackendPluginFactory<TManifest> =>
  Object.assign(
    (options: PluginFactoryOptions<TManifest>): Plugin<TManifest> =>
      ({
        ...implementation(options),
        manifest,
        backend: !!manifest.backend,
      }) as Plugin<TManifest>,
    { manifest },
  );

export { type Plugin, type BackendPluginFactory as PluginFactory, createPlugin };
