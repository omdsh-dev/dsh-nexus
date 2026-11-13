# Nexus 代理

```
主编排 main      全局唯一，只定「归谁、做不做」
 ├─ 项目编排 project   每项目一个，管任务、指挥 Worker
 │    └─ Worker        真正干活，独占一个 worktree
 └─ Supervisor         跨项目时临时拉起，用完即弃
```

| 文件 | 收件箱 | 改代码 | cwd |
| --- | --- | :-: | --- |
| [main.md](main.md) | `type=main` | ❌ 只写笔记 | `~/.nexus/notes/main/` |
| [project.md](project.md) | `type=project` | ❌ 只写笔记 | `~/.nexus/notes/project/<id>/` |
| [worker.md](worker.md) | **无** | ✅ | 任务 worktree |
| [supervisor.md](supervisor.md) | `type=supervisor` | ❌ 只写笔记 | `~/.nexus/notes/supervisor/` |

cwd 是**笔记区**，不是仓库。仓库在 `Project.directory`，用绝对路径读。
`write` 因此天然被关在笔记里 —— 想写代码得用绝对路径，而那要走沙箱。

**一条分界线：main 管归属，project 管执行。** 下面所有例外都是从它推出来的。

## 工具矩阵

这是工具归属的唯一出处，各 agent 文件只列自己的。

| 工具 | main | project | worker | supervisor |
| --- | :-: | :-: | :-: | :-: |
| `read` `glob` `grep` | ✅ | ✅ | ✅ | ✅ |
| `write` `edit` | 笔记 | 笔记 | worktree | 笔记 |
| `pwsh` | 只读 | ✅ | ✅ | 只读 |
| `job_*` `subagent` | ❌ | ✅ | ✅ | ❌ |
| `ask_user` | ✅ | ❌ | ❌ | ❌ |
| `answer` | ✅ | ❌ | ❌ | ✅ |
| `escalate` | ❌ | ✅ | ❌ | ❌ |
| `report` `ask` | ❌ | ✅ | ✅ | ✅ |
| `read_channel` | ✅ | ✅ | 限本任务 | 只读 |
| `reply_channel` | ✅ | ✅ | ✅ | ❌ |
| `ask_user_question` `present` | ❌ | ❌ | ❌ | ❌ |
| `triage_thread` `create_ticket` | ✅ | ❌ | ❌ | ❌ |
| `attach_thread_to_ticket` `unlink_thread` | ✅ | ❌ | ❌ | ❌ |
| `dispatch_ticket` `note_ticket` | ✅ | ❌ | ❌ | ✅ |
| `list_ticket` | 全局 | 本项目 | ❌ | 关联的 |
| `supervisor_list` | 全字段 | 本项目明细 | ❌ | ❌ |
| `create_supervisor` `close_supervisor` | ✅ | ❌ | ❌ | ❌ |
| `attach_tickets_to_supervisor` `detach_tickets_from_supervisor` | ✅ | ❌ | ❌ | ❌ |
| `link_ticket` `stop_ticket` `retry_ticket` | ❌ | ✅ | ❌ | ❌ |
| `create_worker` `send` `view` `cancel` `rename` | ❌ | ✅ | ❌ | ❌ |
| `link_dependency` | ❌ | ❌ | ❌ | ✅ |

四条不显然的：

- **没人能直接写工单状态。** 状态由 `report`、插件观测、引擎推导三处产生。
  编排想结单只能 `stop_ticket`，而它必须绑一条 `human=true` 的触发。
- **没人能自己收工。** Supervisor 的 `closed` 是插件按事实推出来的，没有 `close_self`。
- **`job_*` 不给 main / supervisor**：一挂起就没人分诊、没人协调。
- **Worker 没有 `link_thread`**：挂话题等于扩权（挂上之后那条话题的每条消息都进这张票）。
  它读得到原文、也常常第一个发现挂错，但动作是 `report` 说出来。

## 汇报与求助

同名工具在不同角色上**参数不同，各自一份定义**：

| 工具 | 谁有 | 发给谁 | 等不等 |
| --- | --- | --- | :-: |
| `report(state, summary)` | worker / supervisor | 各自的上级 | ❌ |
| `report(state, summary, supervisorId?, ticketId?)` | project | main，带 `supervisorId` 则 supervisor | ❌ |
| `ask(question)` | worker / supervisor | 各自的上级 | ✅ |
| `ask(question, supervisorId?, ticketId?)` | project | main，带 `supervisorId` 则 supervisor | ✅ |
| `escalate(askId)` | project | main，原样转 | — |
| `ask_user(question, triggerId?)` | main | 人类 | ✅ |

```
worker     → project
project    → main          （给 supervisorId 则 → supervisor）
supervisor → main
main       → user（ask_user）
```

`supervisorId` 只有 project 能填 —— Worker 不知道 Supervisor 存在，Supervisor 没有下级。

**`report` 说事实，`ask` 要决定。** `state` 四种：`progress` / `ready` / `failed` / `dropped`。
「我在等答复」不占状态位，那是 `ask`。

`ask` 挂起的是**这条工作线**，不是会话：Worker 停下等，项目编排继续处理别的票。

## main 的三个强制下行

这三个动作**自动**给项目编排投 `Inbox(type=project, kind=notice)`，调用方不用另外发：

| 动作 | 项目编排收到什么 | `reason` |
| --- | --- | :--: |
| `attach_tickets_to_supervisor` | 你的票被划进某个 Supervisor | — |
| `detach_tickets_from_supervisor` | 你的票退回给你自己管 | ✅ 必填 |
| `close_supervisor` | 协调者没了，附你名下哪些票受影响 | ✅ 必填 |

`detach` / `close` 的 `reason` 是**给它们看的指令**，不是日志：那几张票接下来是收尾、是停、
还是继续等另开的协调，全靠这句话。不给就只能等它 `ask` 回来问一轮。
投递**按项目去重** —— 一个项目有几张票也只收一条。

## 渠道

工具只有一对，具体路径和写法由 `assets/skills/nexus-channel-<id>/SKILL.md` 教。

**`read_channel(resource, offset?, limit?)`** 靠路径前缀分发，不按渠道造工具：

| 前缀 | 例子 |
| --- | --- |
| `github/` | `github/pulls/81/thread/123`、`.../checks` |
| `feishu/` | `feishu/<trigger-id>/message` · `/root` · `/parent` · `/thread` · `/around` |
| `trigger/` `thread/` `ticket/` | 我们自己的领域数据 |

返回 `{ items, next_offset, next_resource }`。**两条翻页轴都要跟完**，否则会误判「读完了」。

**`reply_channel(triggerId, text)`** 锚点是 `triggerId`。bot 身份、像人话、100 词上限。
排队成功 ≠ 送达。

## skill

渠道说明是 `assets/skills/nexus-channel-<id>/SKILL.md`，三段式：frontmatter `name` +
`description` + 正文。**所有角色都能读，不按角色分配** —— catalog 只暴露 `description`，
模型按当前任务自己决定 load 哪份。见 [prisma/README.md](../../prisma/README.md#渠道提示词)。

## 为什么没有 `wait`

依赖关系已经在库里（`TicketLink`、`SupervisorTicket`），再在会话里存一份「我在等谁」，
两份状态必然漂移，且不跨重启。

唤醒只有两条路：**下级主动上报** + **系统兜底通知**。
