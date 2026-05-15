export class WorkerNotRunningError extends Error {
  /** @type {string} */
  workerName;

  /** @type {string} */
  name = "WorkerNotRunningError";

  /** @param {string} workerName */
  constructor(workerName) {
    super(`Worker is not running: "${workerName}"`);

    this.workerName = workerName;
  }
}
