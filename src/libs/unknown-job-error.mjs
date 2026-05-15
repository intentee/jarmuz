export class UnknownJobError extends Error {
  /** @type {string} */
  jobName;

  /** @type {string} */
  name = "UnknownJobError";

  /** @param {string} jobName */
  constructor(jobName) {
    super(`Unknown job: ${jobName}`);

    this.jobName = jobName;
  }
}
