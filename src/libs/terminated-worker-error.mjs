export class TerminatedWorkerError extends Error {
  /** @type {string} */
  workerName;

  /** @type {string} */
  name = "TerminatedWorkerError";

  /** @param {string} workerName */
  constructor(workerName) {
    super(`Worker(${workerName}) is terminated`);

    this.workerName = workerName;
  }
}
