import { basic } from "../../../src/job-types/basic.mjs";
import { exitWorkerOnDrain } from "../../support/exit-worker-on-drain.mjs";

basic(async function () {
  return false;
});

exitWorkerOnDrain();
