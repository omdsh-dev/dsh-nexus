import path from "node:path"
import { defineJsonScheduler } from "../utils/scheduler"
import { DSH_PLUGIN_HOME } from "../config/paths"

export const scheduler = defineJsonScheduler(path.join(DSH_PLUGIN_HOME, 'jobs.json'))

async function main(): Promise<void> {
  await scheduler.ready()
  // scheduler.use({ id, cron }, () => {})
}

main()
