import path from 'node:path'
import { DSH_PLUGIN_HOME } from '../config/paths'
import { defineJsonScheduler } from '../utils/scheduler'

const scheduler = defineJsonScheduler(path.join(DSH_PLUGIN_HOME, 'jobs.json'))

async function main(): Promise<void> {
  await scheduler.ready()
  // scheduler.use({ id, cron }, () => {})
}

main()
