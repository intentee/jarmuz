import { rgPath } from "@vscode/ripgrep";
import { exec } from "node:child_process";
import { promisify } from "node:util";

const execPromisified = promisify(exec);

const VIMGREP_LINE_REGEXP = /^([^:]+):(\d+):(\d+):(.*?)$/;

function escapePattern(pattern) {
  return String(pattern.source).replaceAll("\\", "\\\\");
}

function matchVimgrepLine(vimgrepLine, pattern) {
  const match = vimgrepLine.match(VIMGREP_LINE_REGEXP);

  if (!match) {
    return null;
  }

  const [, file, line, column, content] = match;

  if (!pattern.test(content)) {
    return null;
  }

  return {
    column,
    content,
    file,
    line,
  };
}

function notEmptyLine(line) {
  return line.trim() !== "";
}

function notNull(line) {
  return line !== null;
}

export async function vimgrep({ pattern, where }) {
  const { stdout, stderr } = await execPromisified(
    `${rgPath} -e "${escapePattern(pattern)}" --vimgrep ${where}`,
  );

  if (stderr) {
    throw new Error(`Error executing ripgrep: ${stderr}`);
  }

  return stdout
    .split("\n")
    .filter(notEmptyLine)
    .map(function (line) {
      return matchVimgrepLine(line, pattern);
    })
    .filter(notNull);
}
