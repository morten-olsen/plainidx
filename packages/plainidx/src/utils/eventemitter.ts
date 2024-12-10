class EventEmitter<TEvents extends Record<string, (...args: any[]) => any>> {
  #listeners: Record<keyof TEvents, TEvents[keyof TEvents][]> = {} as any;

  public on = <K extends keyof TEvents>(event: K, listener: TEvents[K]) => {
    if (!this.#listeners[event]) {
      this.#listeners[event] = [];
    }
    this.#listeners[event].push(listener);
    return () => this.off(event, listener);
  };

  public off = <K extends keyof TEvents>(event: K, listener: TEvents[K]) => {
    if (!this.#listeners[event]) {
      return;
    }
    this.#listeners[event] = this.#listeners[event].filter((l) => l !== listener);
  };

  public emit = async <K extends keyof TEvents>(event: K, ...args: Parameters<TEvents[K]>) => {
    if (!this.#listeners[event]) {
      return;
    }
    const actions = this.#listeners[event].map((listener) => listener(...args));
    await Promise.all(actions);
  };
}

export { EventEmitter };
