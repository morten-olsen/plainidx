import { DatabaseMigration } from '../../databases/databases.js';

const migrations: DatabaseMigration[] = [
  {
    name: 'init',
    up: async (knex) => {
      await knex.schema.createTable('files', (table) => {
        table.string('id').primary();
        table.string('location').notNullable();
        table.string('hash').notNullable();
        table.dateTime('updatedAt').notNullable();
        table.dateTime('syncedAt').nullable();
        table.unique('location');
        table.index('updatedAt');
        table.index('hash');
      });
    },
    down: async (knex) => {
      await knex.schema.dropTable('files');
    },
  },
];

export { migrations };
