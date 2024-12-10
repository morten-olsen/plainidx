import { Document } from '../documents/documents.document.js';
import { EventEmitter } from '../utils/eventemitter.js';

type EditorRender = {
  supports: (document: Document) => boolean;
  name: string;
  component: React.ComponentType;
};

type EditorRendersEvents = {
  change: () => void;
};

class EditorRenders extends EventEmitter<EditorRendersEvents> {
  #renders: EditorRender[] = [];

  public add = (render: EditorRender) => {
    this.#renders.push(render);
    this.emit('change');

    return () => {
      this.#renders = this.#renders.filter((r) => r !== render);
      this.emit('change');
    };
  };

  public getByDocument = (document: Document) => {
    return this.#renders.filter((r) => r.supports(document));
  };
}

export { EditorRenders };
