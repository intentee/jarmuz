export function scheduler(state) {
  return Object.freeze({
    unique(name, callback) {
      if (state.pending.has(name)) {
        clearTimeout(state.pending.get(name));
        state.pending.delete(name);
      }

      state.pending.set(name, setTimeout(callback, 100));
    },
  });
}
