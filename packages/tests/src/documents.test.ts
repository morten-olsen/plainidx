import { describe, it } from 'vitest';
import { CorePlugin } from '@plainidx/plugin-core';
import { MarkdownPlugin } from '@plainidx/plugin-markdown';
import { PlainDB } from '../../plainidx/dist/exports.js';
import { MemoryFileSystem } from '@plainidx/fs-memory';

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

    await plugins.add([MarkdownPlugin]);

    const tags1 = await plugins.action(CorePlugin, 'getTags', undefined);

    console.log('Done', tags1);

    const demoDocument = await documents.get('hello/world.md');

    demoDocument.data = Buffer.from(`
# Hello World

:tag[hello]
`);

    await demoDocument.save();

    const tags2 = await plugins.action(CorePlugin, 'getTags', undefined);
    console.log('Done', tags2);

    demoDocument.data = Buffer.from(`
# Hello World

:tag[world]
`);
    await demoDocument.save();

    const tags3 = await plugins.action(CorePlugin, 'getTags', undefined);
    console.log('Done', tags3);

    await close();
  });
});
