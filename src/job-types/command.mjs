import { spawner } from "./spawner.mjs";

/** @param {string} exec */
export function command(exec) {
  return spawner(async function ({ command: execCommand, resetConsole }) {
    resetConsole();

    return execCommand(exec);
  });
}
