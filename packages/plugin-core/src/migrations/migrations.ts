import { DatabaseMigration } from '@plainidx/plainidx';

const migrations: DatabaseMigration[] = [
  {
    name: 'init',
    up: async (db) => {
      await db.schema.createTable('tags', (table) => {
        table.string('name').notNullable();
        table.string('location').notNullable();
        table.primary(['name', 'location']);
        table.index('location');
        table.index('name');
      });

      await db.schema.createTable('titles', (table) => {
        table.string('location').primary().notNullable();
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
