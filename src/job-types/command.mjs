import { spawner } from "./spawner.mjs";

export function command(exec) {
  return spawner(async function ({ command: execCommand, resetConsole }) {
    await resetConsole();

    return execCommand(exec);
  });
}
