import { persist } from "jarmuz/job-types";

persist(async function ({ keepAlive }) {
  keepAlive(
    process.execPath +
      " " +
      process.env.JARMUZ_PID_SCRIPT +
      " " +
      process.env.JARMUZ_PID_FILE,
  );
});
