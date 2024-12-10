import { Root, Node as BaseNode } from 'mdast';
import { type PropertyName } from 'lodash';
import get from 'lodash/get.js';
import set from 'lodash/set.js';
import remarkDirective from 'remark-directive';
import remarkFrontmatter from 'remark-frontmatter';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkParse from 'remark-parse';
import remarkStringify from 'remark-stringify';
import { unified } from 'unified';
import { toString } from 'mdast-util-to-string';

type Node = {
  children?: Node[];
  attributes?: Record<string, unknown>;
  name?: string;
  depth?: number;
  value?: string;
} & BaseNode;

const compiler = unified()
  .use(remarkParse)
  .use(remarkStringify)
  .use(remarkGfm)
  .use(remarkFrontmatter, ['yaml'])
  .use(remarkDirective)
  .use(remarkMath);

class MarkdownAst {
  content: Root;

  constructor(content: Buffer) {
    this.content = this.#parse(content.toString());
  }

  public set = (path: PropertyName[], value: unknown) => {
    set(this.content, path, value);
  };

  public get = (path: PropertyName[]) => {
    return get(this.content, path);
  };

  #parse = (input: string | null) => {
    const ast = compiler.parse(input || '');
    return ast;
  };

  public toBuffer = () => {
    const output = compiler.stringify(this.content);
    return Buffer.from(output);
  };

  public visit = (visitor: (node: Node, path: PropertyName[]) => void) => {
    const visit = (node: Node, path: PropertyName[]) => {
      visitor(node, path);
      if (node.children) {
        node.children.forEach((child, index) => {
          visit(child, [...path, 'children', index]);
        });
      }
    };
    visit(this.content, []);
  };

  public nodeToString = (node: Node[] = []) => {
    return toString(node);
  };

  public patch = (visitor: (node: Node, path: PropertyName[]) => void) => {
    this.visit(visitor);
  };
}

export { MarkdownAst, type Node };
