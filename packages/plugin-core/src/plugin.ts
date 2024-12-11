import { createPlugin } from '@plainidx/plainidx';
import { CorePlugin } from './manifest.js';
import { migrations } from './migrations/migrations.js';

const core = createPlugin(CorePlugin, ({ getDb }) => {
  const dbPromise = getDb('data', migrations);
  return {
    backend: true,
    actions: {
      getTitles: async () => {
        const db = await dbPromise;
        const results = await db('titles').select(['location', 'title']);
        return results;
      },
      getTags: async () => {
        const db = await dbPromise;
        const results = await db('tags')
          .select(['name', db.raw('count(*) as count')])
          .groupBy('name');
        return results;
      },
      setData: async ({ location, title, tags }) => {
        const db = await dbPromise;
        const currentTitle = await db('titles').select('title').where({ location }).first();
        await db.transaction(async (trx) => {
          await trx('tags').delete().where({ location });
          await trx('tags').insert(tags.map((tag) => ({ name: tag, location })));
          if (currentTitle) {
            await trx('titles').update({ title }).where({ location });
          } else {
            await trx('titles').insert({ location, title });
          }
        });
      },
    },
  };
});

export { core };
