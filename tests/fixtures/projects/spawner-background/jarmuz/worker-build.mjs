import { spawner } from "jarmuz/job-types";

spawner(async function ({ background }) {
  background(
    process.execPath +
      " " +
      process.env.JARMUZ_PID_SCRIPT +
      " " +
      process.env.JARMUZ_PID_FILE,
  );
});
