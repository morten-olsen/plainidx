import { Document } from '../documents/documents.document.js';
import { EventEmitter } from '../utils/eventemitter.js';

type WorkspaceEvents = {
  change: () => void;
};

class EditorWorkspace extends EventEmitter<WorkspaceEvents> {
  #documents: Set<Document> = new Set<Document>();

  public get documents() {
    return [...this.#documents];
  }

  public openDocument(document: Document) {
    this.#documents.add(document);
    this.emit('change');
  }

  public closeDocument(document: Document) {
    this.#documents.delete(document);
    this.emit('change');
  }
}

export { EditorWorkspace };
