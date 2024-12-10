import { createActionApiRoute, type Database, Plugin, z } from '@plaindb/plaindb';
import { migrations } from './migrations/migrations.js';

class CorePlugin extends Plugin {
  #db?: Promise<Database>;

  public readonly name = '@builtin/core';

  public actions = {
    setTags: createActionApiRoute({
      input: z.object({
        document: z.string(),
        tags: z.array(z.string()),
      }),
      output: z.undefined(),
      handle: async ({ document, tags }) => {
        await this.setTags(document, tags);
        return undefined;
      },
    }),
    getTags: createActionApiRoute({
      output: z.array(
        z.object({
          name: z.string(),
          count: z.number(),
        }),
      ),
      handle: async () => {
        return this.getTags();
      },
    }),
    setTitle: createActionApiRoute({
      input: z.object({
        document: z.string(),
        title: z.string(),
      }),
      output: z.undefined(),
      handle: async ({ document, title }) => {
        await this.setTitle(document, title);
        return undefined;
      },
    }),
    getTitles: createActionApiRoute({
      output: z.array(
        z.object({
          document: z.string(),
          title: z.string(),
        }),
      ),
      handle: async () => {
        return this.getTitles();
      },
    }),
  };

  #getDatabase = async () => {
    if (!this.#db) {
      this.#db = this.getDB('data', migrations);
    }
    return this.#db;
  };

  public getTags = async () => {
    const db = await this.#getDatabase();
    return db('tags')
      .select([db.raw('tag as name'), db.raw('count(document) as count')])
      .groupBy('tag');
  };

  public setTags = async (document: string, tags: string[]) => {
    const db = await this.#getDatabase();
    await db('tags').where({ document }).delete();
    if (tags.length) {
      await db('tags').insert(tags.map((tag) => ({ tag, document })));
    }
  };

  public setTitle = async (document: string, title: string) => {
    const db = await this.#getDatabase();
    await db('titles').where({ document }).insert({ document, title }).onConflict('document').merge();
  };

  public getTitles = async () => {
    const db = await this.#getDatabase();
    return await db('titles').select('*');
  };
}

export { CorePlugin };
