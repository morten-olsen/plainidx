import { FileSystem } from '@plaindb/plaindb';
import { existsSync } from 'fs';
import { mkdir, readFile, writeFile } from 'fs/promises';
import { dirname, resolve } from 'path';
import { glob } from 'glob';

type SystemFileSystemOptions = {
  cwd: string;
};

class SystemFileSystem extends FileSystem {
  #options: SystemFileSystemOptions;

  constructor(options: SystemFileSystemOptions) {
    super();
    this.#options = options;
  }

  public get = async (location: string): Promise<Buffer | undefined> => {
    const { cwd } = this.#options;
    const actualLocation = resolve(cwd, location);
    if (!existsSync(actualLocation)) {
      return undefined;
    }
    return readFile(actualLocation);
  };

  public set = async (location: string, data: Buffer): Promise<void> => {
    const { cwd } = this.#options;
    const actualLocation = resolve(cwd, location);
    const dir = dirname(actualLocation);
    if (!existsSync(dir)) {
      await mkdir(dir, { recursive: true });
    }
    await writeFile(actualLocation, data);
  };

  public update = async () => {
    const { cwd } = this.#options;
    const files = await glob('**/*', {
      cwd,
      nodir: true,
    });
    await this.emit('changed', files);
  };
}

export { SystemFileSystem };
