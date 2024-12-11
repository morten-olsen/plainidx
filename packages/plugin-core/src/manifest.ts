import { Manifest, z } from '@plainidx/plainidx';

const CorePlugin = {
  id: 'buildin-core',
  name: 'Core Plugin',
  version: '0.0.1',
  config: z.any(),
  backend: {
    main: './dist/plugin.js',
    actions: {
      getTitles: {
        input: z.object({}),
        output: z.array(z.object({ location: z.string(), title: z.string() })),
      },
      getTags: {
        input: z.object({}),
        output: z.array(z.string()),
      },
      setData: {
        input: z.object({
          location: z.string(),
          title: z.string(),
          tags: z.array(z.string()),
        }),
        output: z.any(),
      },
    },
  },
} satisfies Manifest;

export { CorePlugin };
