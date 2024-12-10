import { EventEmitter } from '../utils/eventemitter.js';

type DocumentEvent = {
  save: (document: Document) => void;
  change: (document: Document) => void;
};

type DocumentOptions = {
  id: string;
  location: string;
  data: Buffer;
};

class Document extends EventEmitter<DocumentEvent> {
  #id: string;
  #location: string;
  #data: Buffer;

  constructor({ location, data, id }: DocumentOptions) {
    super();
    this.#id = id;
    this.#location = location;
    this.#data = data;
  }

  public get id() {
    return this.#id;
  }

  public get location() {
    return this.#location;
  }

  public get data() {
    return this.#data;
  }

  public set data(data: Buffer) {
    this.#data = data;
    this.emit('change', this);
  }

  public replace = (data: Buffer) => {
    this.#data = data;
  };

  public save = async () => {
    await this.emit('save', this);
  };
}

export { Document };
