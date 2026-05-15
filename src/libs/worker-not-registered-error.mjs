export class WorkerNotRegisteredError extends Error {
  /** @type {string} */
  workerName;

  /** @type {string} */
  name = "WorkerNotRegisteredError";

  /** @param {string} workerName */
  constructor(workerName) {
    super(`Worker is not registered: "${workerName}"`);

    this.workerName = workerName;
  }
}
