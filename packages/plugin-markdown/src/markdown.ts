import { createActionApiRoute, Document, Plugin, z } from '@plaindb/plaindb';
import { MarkdownAst } from './utils/markdown-ast.js';
import { CorePlugin } from '@plaindb/plugin-core';

type MarkdownSubPlugin = {
  process: (ast: MarkdownAst) => Promise<void>;
};

class MarkdownPlugin extends Plugin {
  #subPlugins = new Set<MarkdownSubPlugin>();

  public readonly name = '@builtin/markdown';

  public actions = {
    register: createActionApiRoute({
      input: z.object({
        plugin: z.custom<MarkdownSubPlugin>(),
      }),
      handle: async ({ plugin }) => {
        this.#subPlugins.add(plugin);
      },
    }),
  };

  public process = async (document: Document) => {
    if (!document.location.endsWith('.md')) {
      return;
    }
    const ast = new MarkdownAst(document.data);

    for (const plugin of this.#subPlugins) {
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

    await this.action(CorePlugin, 'setTitle', {
      title,
      document: document.location,
    });

    ast.visit((node) => {
      if (node.type === 'textDirective' && node.name === 'tag') {
        const body = ast.nodeToString(node.children);
        tags.push(body);
      }
    });
    document.replace(ast.toBuffer());
    await this.action(CorePlugin, 'setTags', {
      tags,
      document: document.location,
    });
  };
}

export { MarkdownPlugin };
