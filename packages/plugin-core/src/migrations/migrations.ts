import { DatabaseMigration } from '@plainidx/plainidx';

const migrations: DatabaseMigration[] = [
  {
    name: 'init',
    up: async (db) => {
      await db.schema.createTable('tags', (table) => {
        table.string('tag').notNullable();
        table.string('document').notNullable();
        table.primary(['tag', 'document']);
        table.index('document');
        table.index('tag');
      });

      await db.schema.createTable('titles', (table) => {
        table.string('document').primary().notNullable();
        table.string('title').notNullable();
      });
    },
    down: async (db) => {
      await db.schema.dropTable('tags');
      await db.schema.dropTable('titles');
    },
  },
];

export { migrations };
