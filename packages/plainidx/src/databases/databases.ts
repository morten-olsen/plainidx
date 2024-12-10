import knex, { Knex } from 'knex';

type DatabaseMigration = {
  name: string;
  up: (knex: Knex) => Promise<void>;
  down: (knex: Knex) => Promise<void>;
};

type DatabaseGetOptions = {
  name: string;
  migrations: DatabaseMigration[];
};

type DatabasesOptions = {
  getConfig: (name: string) => Knex.Config;
};

class Databases {
  #dbs = new Map<string, Knex>();
  #options: DatabasesOptions;

  constructor(options: DatabasesOptions) {
    this.#options = options;
  }

  public get = async ({ name, migrations }: DatabaseGetOptions) => {
    if (!this.#dbs.has(name)) {
      const { getConfig } = this.#options;
      const migrationSource: Knex.MigrationSource<DatabaseMigration> = {
        getMigrations: async () => migrations,
        getMigrationName: (migration) => migration.name,
        getMigration: async (migration) => migration,
      };
      const config: Knex.Config = {
        ...getConfig(name),
        migrations: {
          migrationSource,
        },
      };
      const db = knex(config);
      await db.migrate.latest();
      this.#dbs.set(name, db);
    }
    const value = this.#dbs.get(name);
    if (!value) {
      throw new Error('Database not found');
    }
    return value;
  };

  public close = async () => {
    await Promise.all(Array.from(this.#dbs.values()).map((db) => db.destroy()));
  };
}

export { Databases, type DatabasesOptions, type DatabaseMigration, type DatabaseGetOptions };
