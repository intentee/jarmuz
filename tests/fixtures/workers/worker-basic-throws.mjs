import { basic } from "../../../src/job-types/basic.mjs";
import { exitWorkerOnDrain } from "../../support/exit-worker-on-drain.mjs";

basic(async function () {
  throw new Error("build failed");
});

exitWorkerOnDrain();
