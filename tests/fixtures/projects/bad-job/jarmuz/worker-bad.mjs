import { appendFile } from "node:fs/promises";

import { basic } from "jarmuz/job-types";

basic(async function ({ name }) {
  await appendFile(process.env.JARMUZ_RESULT_FILE, name);

  return false;
});
