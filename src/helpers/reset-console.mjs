export function resetConsole() {
  process.stdout.write("\x1Bc");
  process.stdout.write("\x1B[2J");
}
