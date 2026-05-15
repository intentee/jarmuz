export class DuplicateKeepAliveError extends Error {
  /** @type {string} */
  exec;

  /** @type {string} */
  name = "DuplicateKeepAliveError";

  /** @param {string} exec */
  constructor(exec) {
    super(`Duplicate keepAlive call within a build for exec: "${exec}"`);

    this.exec = exec;
  }
}
