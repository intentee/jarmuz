/**
 * @typedef {object} Scheduler
 * @property {(name: string, callback: () => void) => void} unique
 */

/**
 * @param {import("./jarmuz.mjs").State} state
 * @returns {Scheduler}
 */
export function scheduler(state) {
  return Object.freeze({
    /**
     * @param {string} name
     * @param {() => void} callback
     */
    unique(name, callback) {
      if (state.pending.has(name)) {
        clearTimeout(state.pending.get(name));
        state.pending.delete(name);
      }

      state.pending.set(name, setTimeout(callback, 100));
    },
  });
}
