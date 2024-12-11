import { CorePlugin } from '@plainidx/plugin-core';
import { MarkdownPlugin } from './manifest.js';
import { MarkdownAst } from './utils/markdown-ast.js';
import { createPlugin } from '@plainidx/plainidx';

type MarkdownSubPlugin = {
  process: (ast: MarkdownAst) => Promise<void>;
};

const markdownPlugin = createPlugin(MarkdownPlugin, ({ getPlugin }) => {
  const plugins: MarkdownSubPlugin[] = [];
  return {
    actions: {},
    process: async (document) => {
      const core = await getPlugin(CorePlugin);
      if (!document.location.endsWith('.md')) {
        return;
      }
      const ast = new MarkdownAst(document.data);

      for (const plugin of plugins) {
        await plugin.process(ast);
      }

      const tags: string[] = [];
      let topHead = Number.MAX_SAFE_INTEGER;
      let title = 'Untitles';

      ast.visit((node) => {
        if (node.type !== 'heading') {
          return;
        }
        if (node.depth === undefined) {
          return;
        }
        if (node.depth < topHead) {
          topHead = node.depth;
          title = ast.nodeToString(node.children);
        }
      });

      ast.visit((node) => {
        if (node.type === 'textDirective' && node.name === 'tag') {
          const body = ast.nodeToString(node.children);
          tags.push(body);
        }
      });
      document.replace(ast.toBuffer());

      await core.actions.setData({
        location: document.location,
        title,
        tags,
      });
    },
  };
});

export { markdownPlugin };
