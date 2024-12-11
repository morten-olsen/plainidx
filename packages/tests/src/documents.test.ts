import { describe, it } from 'vitest';
import { core, CorePlugin } from '@plainidx/plugin-core';
import { PlainDB } from '../../plainidx/dist/exports.js';
import { MemoryFileSystem } from '@plainidx/fs-memory';
import { markdownPlugin } from '@plainidx/plugin-markdown';

describe('documents', () => {
  it('should be able to create a document', async () => {
    const fs = new MemoryFileSystem({});

    const { plugins, documents, close } = new PlainDB({
      fs,
      getDBConfig: () => ({
        client: 'sqlite',
        useNullAsDefault: false,
        connection: {
          filename: ':memory:',
        },
      }),
    });

    await plugins.add([core, markdownPlugin]);

    const plugin = await plugins.get(CorePlugin);

    {
      const tags = await plugin.actions.getTags({});
      console.log(tags);
    }

    const document = await documents.get('foo/bar.md');

    document.data = Buffer.from(['# Hello World', '', ':tag[test]'].join('\n'));

    await document.save();
    {
      const tags = await plugin.actions.getTags({});
      console.log(tags);
    }

    await close();
  });
});
