/**
 * @typedef {object} Scheduler
 * @property {(name: string, callback: () => void) => void} debounce
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
    debounce(name, callback) {
      if (state.pending.has(name)) {
        clearTimeout(state.pending.get(name));
        state.pending.delete(name);
      }

      state.pending.set(name, setTimeout(callback, 100));
    },
  });
}
