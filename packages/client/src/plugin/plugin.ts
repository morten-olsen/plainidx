import { Manifest, ManifestBackend, z } from '@plainidx/base';

type Plugin<TManifest extends Manifest> = {
  manifest: TManifest;
  actions: TManifest['backend'] extends ManifestBackend
  ? {
    [TKey in keyof TManifest['backend']['actions']]: (
      input: z.infer<TManifest['backend']['actions'][TKey]['input']>,
    ) => Promise<z.infer<TManifest['backend']['actions'][TKey]['output']>>;
  }
  : Record<string, never>;
};

export { Plugin };
