import { EventEmitter } from '../utils/eventemitter.js';

type FileSystemEvents = {
  changed: (locations: string[]) => void;
};

abstract class FileSystem extends EventEmitter<FileSystemEvents> {
  abstract get: (location: string) => Promise<Buffer | undefined>;
  abstract set: (location: string, data: Buffer) => Promise<void>;
}

export { FileSystem };
