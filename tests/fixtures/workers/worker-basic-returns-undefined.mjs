import { basic } from "../../../src/job-types/index.mjs";
import { exitWorkerOnDrain } from "../../support/exit-worker-on-drain.mjs";

basic(async function () {});

exitWorkerOnDrain();
