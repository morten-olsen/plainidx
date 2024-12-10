import { EventEmitter } from '../utils/eventemitter.js';

type EditorPanel = {
  name: string;
  icon: string;
  component: React.ComponentType;
};

type EditorPanelsEvents = {
  change: () => void;
};

class EditorPanels extends EventEmitter<EditorPanelsEvents> {
  #panels: Map<string, EditorPanel>;

  constructor() {
    super();
    this.#panels = new Map();
  }

  public get panels() {
    return this.#panels;
  }

  public add(id: string, panel: EditorPanel) {
    this.#panels.set(id, panel);
    this.emit('change');
    return () => {
      this.#panels.delete(id);
      this.emit('change');
    };
  }

  public get(id: string) {
    return this.#panels.get(id);
  }
}

export { EditorPanels };
