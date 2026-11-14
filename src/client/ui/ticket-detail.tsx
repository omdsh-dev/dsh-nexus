import type { ReactNode } from 'react'
import { Button, Tag } from '@deepseek-ai/dsh-client-ui-primitives'
import { ArrowLeftIcon } from '../components/icons'
import { OVERVIEW_CHANNEL_LABELS, OVERVIEW_STATUS, OVERVIEW_TASKS } from '../constants'
import { useActions, useStore } from '../hooks/use-store'
import { useTranslation } from '../hooks/use-translation'

export function TicketDetail(): ReactNode {
  const { t } = useTranslation()
  const { go } = useActions()
  const { ticketId, returnTo } = useStore(state => state.navigation)
  const task = OVERVIEW_TASKS.find(task => task.id === ticketId)
  return (
    <section className="flex flex-col gap-5 pb-10">
      <div><Button variant="ghost" size="sm" icon={<ArrowLeftIcon width={16} height={16} />} onClick={() => go(returnTo)}>{t('ticketBack')}</Button></div>
      {!task
        ? (
            <div className="rounded-2xl border border-[var(--dsw-alias-border-l3)] p-6">
              <h2 className="text-base font-medium">{t('ticketNotFound')}</h2>
              <p className="mt-2 text-[13px] text-[var(--dsw-alias-label-secondary)]">{t('ticketNotFoundDescription')}</p>
              <Button variant="outline" size="sm" onClick={() => go('ticket')} className="mt-4">{t('tabTickets')}</Button>
            </div>
          )
        : (
            <>
              <header>
                <div className="mb-2 flex items-center gap-3">
                  <span className="text-xs text-[var(--dsw-alias-label-tertiary)]">{task.id}</span>
                  <Tag tone={OVERVIEW_STATUS[task.status].tone}>{t(OVERVIEW_STATUS[task.status].label)}</Tag>
                  <Tag tone="quiet">{t('overviewDemo')}</Tag>
                </div>
                <h2 className="text-lg leading-7 font-medium">{t(task.title)}</h2>
              </header>
              <dl className="grid grid-cols-1 gap-5 rounded-2xl border border-[var(--dsw-alias-border-l3)] bg-[var(--dsw-alias-bg-layer-1)] p-5 sm:grid-cols-3">
                <div>
                  <dt className="text-xs text-[var(--dsw-alias-label-tertiary)]">{t('ticketId')}</dt>
                  <dd className="mt-2 text-[13px]">{task.id}</dd>
                </div>
                <div>
                  <dt className="text-xs text-[var(--dsw-alias-label-tertiary)]">{t('overviewSource')}</dt>
                  <dd className="mt-2 text-[13px]">
                    {OVERVIEW_CHANNEL_LABELS[task.channel]}
                    {task.event ? ` · ${task.event}` : ''}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-[var(--dsw-alias-label-tertiary)]">{t(task.status === 'waiting' ? 'overviewSleepDuration' : 'overviewDuration')}</dt>
                  <dd className="mt-2 text-[13px] tabular-nums">{task.duration}</dd>
                </div>
              </dl>
              <div className="rounded-2xl border border-[var(--dsw-alias-border-l3)] p-5">
                <h3 className="text-[13px] font-medium">{t('ticketTemplate')}</h3>
                <p className="mt-2 text-xs leading-5 text-[var(--dsw-alias-label-secondary)]">{t('ticketTemplateDescription')}</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <section className="rounded-2xl border border-[var(--dsw-alias-border-l3)] p-5">
                  <h3 className="text-[13px] font-medium">{t('ticketActivity')}</h3>
                  <p className="py-10 text-center text-xs text-[var(--dsw-alias-label-tertiary)]">{t('ticketActivityEmpty')}</p>
                </section>
                <section className="rounded-2xl border border-[var(--dsw-alias-border-l3)] p-5">
                  <h3 className="text-[13px] font-medium">{t('ticketArtifacts')}</h3>
                  <p className="py-10 text-center text-xs text-[var(--dsw-alias-label-tertiary)]">{t('ticketArtifactsEmpty')}</p>
                </section>
              </div>
            </>
          )}
    </section>
  )
}
