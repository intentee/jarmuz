import { command } from "../../../src/job-types/command.mjs";
import { exitWorkerOnDrain } from "../../support/exit-worker-on-drain.mjs";

command("true");

exitWorkerOnDrain();
