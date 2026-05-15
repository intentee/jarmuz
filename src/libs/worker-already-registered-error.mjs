export class WorkerAlreadyRegisteredError extends Error {
  /** @type {string} */
  workerName;

  /** @type {string} */
  name = "WorkerAlreadyRegisteredError";

  /** @param {string} workerName */
  constructor(workerName) {
    super(`Worker is already registered: "${workerName}"`);

    this.workerName = workerName;
  }
}
