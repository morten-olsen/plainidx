import { SystemFileSystem } from '@plaindb/fs-system';
import { CorePlugin } from '@plaindb/plugin-core';
import { MarkdownPlugin } from '@plaindb/plugin-markdown';
import { resolve } from 'path';
import { PlainDB } from '../../plaindb/dist/exports.js';

const fs = new SystemFileSystem({
  cwd: resolve('/Users/alice/Documents/Exo'),
});

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

await fs.update();

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
