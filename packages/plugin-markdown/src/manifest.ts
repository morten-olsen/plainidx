import { Manifest, z } from '@plainidx/plainidx';

const MarkdownPlugin = {
  id: 'markdown',
  name: 'Markdown Plugin',
  version: '0.0.1',
  config: z.any(),
  backend: {
    main: './dist/plugin.js',
    actions: {},
  },
} satisfies Manifest;

export { MarkdownPlugin };
