/* eslint-disable antfu/no-top-level-await */
import type { DB } from './types'
import { DatabaseSync } from 'node:sqlite'
import { NodeSqliteDialect } from '@fileshed/kysely-node-sqlite'
import { Kysely } from 'kysely'
import { Migrator } from 'kysely/migration'
import { migrations } from './migrations'
import { Channel } from './models/channel'
import { ChannelAccount } from './models/channel-account'
import { CiWatch } from './models/ci-watch'
import { Inbox } from './models/inbox'
import { Project } from './models/project'
import { Setting } from './models/setting'
import { SourceState } from './models/source-state'
import { Supervisor } from './models/supervisor'
import { SupervisorTicket } from './models/supervisor-ticket'
import { Thread } from './models/thread'
import { Ticket } from './models/ticket'
import { TicketLink } from './models/ticket-link'
import { TicketThread } from './models/ticket-thread'
import { Trigger } from './models/trigger'
import { Worker } from './models/worker'
import { MigrationProvider } from './utils/migration'

const database = new DatabaseSync('data.db')

const connection = new Kysely<DB>({
  dialect: new NodeSqliteDialect({ database }),
})

/** Kysely 连接 + 每张表一个模型；模型方法都在 `./models/*` 里。 */
export const db = Object.assign(connection, {
  channel: new Channel(connection),
  channelAccount: new ChannelAccount(connection),
  ciWatch: new CiWatch(connection),
  inbox: new Inbox(connection),
  project: new Project(connection),
  setting: new Setting(connection),
  sourceState: new SourceState(connection),
  supervisor: new Supervisor(connection),
  supervisorTicket: new SupervisorTicket(connection),
  thread: new Thread(connection),
  ticket: new Ticket(connection),
  ticketLink: new TicketLink(connection),
  ticketThread: new TicketThread(connection),
  trigger: new Trigger(connection),
  worker: new Worker(connection),
})

const migrator = new Migrator({
  db,
  provider: new MigrationProvider(database, migrations),
})
const { error } = await migrator.migrateToLatest()
if (error)
  throw error
