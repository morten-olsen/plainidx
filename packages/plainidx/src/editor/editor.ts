import { EventEmitter } from '../utils/eventemitter.js';
import { EditorPanels } from './editor.panels.js';
import { EditorRenders } from './editor.renders.js';
import { EditorWorkspace } from './editor.workspace.js';

type EditorEvents = Record<string, never>;

class Editor extends EventEmitter<EditorEvents> {
  #workspace: EditorWorkspace;
  #renders: EditorRenders;
  #panels: EditorPanels;

  constructor() {
    super();
    this.#workspace = new EditorWorkspace();
    this.#renders = new EditorRenders();
    this.#panels = new EditorPanels();
  }

  public get workspace() {
    return this.#workspace;
  }

  public get renders() {
    return this.#renders;
  }

  public get panels() {
    return this.#panels;
  }
}

export { Editor };
