import { FileSystem } from '@plainidx/plainidx';

type MemoryFileSystemOptions = {
  documents?: Record<string, Buffer>;
};

class MemoryFileSystem extends FileSystem {
  #options: MemoryFileSystemOptions;
  #files: Record<string, Buffer | undefined>;

  constructor(options: MemoryFileSystemOptions = {}) {
    super();
    this.#options = options;
    this.#files = {
      ...this.#options.documents,
    };
  }

  public get = async (location: string): Promise<Buffer | undefined> => {
    return this.#files[location];
  };

  public set = async (location: string, data: Buffer): Promise<void> => {
    this.#files[location] = data;
  };

  public update = async (files: Record<string, Buffer | undefined>) => {
    this.#files = {
      ...this.#files,
      ...files,
    };
    this.emit('changed', Object.keys(files));
  };
}

export { MemoryFileSystem };
