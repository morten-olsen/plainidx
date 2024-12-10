import { Knex } from 'knex';
import { nanoid } from 'nanoid';
import { createHash } from 'crypto';
import { Databases } from '../databases/databases.js';
import { FileSystem } from '../filesystem/filesystem.js';
import { EventEmitter } from '../utils/eventemitter.js';
import { Document } from './documents.document.js';
import { migrations } from './migrations/migrations.js';

type DocumentsEvents = {
  change: (loctions: string[]) => void;
  save: (document: Document) => void;
};

type DocumentsOptions = {
  fs: FileSystem;
  databases: Databases;
};

class Documents extends EventEmitter<DocumentsEvents> {
  #options: DocumentsOptions;
  #documents: Map<string, Document>;
  #db?: Promise<Knex>;

  constructor(options: DocumentsOptions) {
    super();
    this.#options = options;
    this.#documents = new Map();
    this.#options.fs.on('changed', this.#onChanges);
  }

  #onChanges = async (changes: string[]) => {
    const db = await this.#getDB();
    const actualChanges: string[] = [];
    for (const location of changes) {
      const current = await db('files').where({ location }).first();
      const document = await this.get(location);
      const hash = createHash('sha256').update(document.data).digest('hex');
      if (!current) {
        await db('files').insert({
          id: nanoid(),
          location,
          hash,
          updatedAt: new Date(),
        });
      } else if (current.hash !== hash) {
        await db('files').where({ location }).update({
          hash,
          updatedAt: new Date(),
        });
      } else {
        continue;
      }
      await this.emit('save', document);
      actualChanges.push(location);
    }
    if (actualChanges.length) {
      this.emit('change', actualChanges);
    }
  };

  #getDB = async () => {
    if (!this.#db) {
      const { databases } = this.#options;
      this.#db = databases.get({
        name: 'documents',
        migrations,
      });
    }
    return this.#db;
  };

  #onSave = async (document: Document) => {
    const { fs } = this.#options;
    await this.emit('save', document);
    await fs.set(document.location, document.data);
  };

  public all = async () => {
    const db = await this.#getDB();
    const files = await db('files').select('*');
    return files.map((file: { location: string }) => file.location as string);
  };

  public get = async (location: string) => {
    if (!this.#documents.has(location)) {
      const db = await this.#getDB();
      const { fs } = this.#options;
      const data = await fs.get(location);
      const current = await db('files').select('*').where({ location }).first();
      const document = new Document({
        id: current?.id || nanoid(),
        location,
        data: data || Buffer.from(''),
      });
      document.on('save', this.#onSave);
      this.#documents.set(location, document);
    }
    const value = this.#documents.get(location);
    if (!value) {
      throw new Error('Document not found');
    }
    return value;
  };
}

export { Documents };
export { Document } from './documents.document.js';
