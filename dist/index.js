import process from "node:process";
import { defineTool } from "@deepseek-ai/dsh-tools";
//#region src/utils/agent.ts
function definePreset(definition) {
	const { tools, ...preset } = definition;
	return {
		tools: tools ?? [],
		preset: {
			...preset,
			plugins: [preset.instruction && {
				id: "persona",
				name: "@deepseek-ai/dsh-persona",
				config: { persona: preset.instruction }
			}, ...preset.plugins ?? []].filter(Boolean)
		}
	};
}
//#endregion
//#region src/ai/_shared/plugins/index.ts
const IS_WINDOWS = process.platform === "win32";
const agentInstructions = {
	id: "agent-instructions",
	name: "@deepseek-ai/dsh-agent-instructions",
	config: { maxBytes: 65536 }
};
const timeContext = {
	id: "time-context",
	name: "@deepseek-ai/dsh-time-context"
};
const toolBash = {
	id: "tool-bash",
	name: "@deepseek-ai/dsh-tool-bash",
	disabled: IS_WINDOWS
};
const toolPwsh = {
	id: "tool-pwsh",
	name: "@deepseek-ai/dsh-tool-pwsh",
	disabled: !IS_WINDOWS
};
const toolFs = {
	id: "tool-fs",
	name: "@deepseek-ai/dsh-tool-fs",
	config: { applyPatch: false }
};
const toolFsSearch = {
	id: "tool-fs-search",
	name: "@deepseek-ai/dsh-tool-fs-search",
	config: { sampleOverCapGlobResults: false }
};
const toolJobs = {
	id: "tool-jobs",
	name: "@deepseek-ai/dsh-tool-jobs"
};
const skillFilesystem = {
	id: "skill-filesystem",
	name: "@deepseek-ai/dsh-skill-filesystem"
};
const toolSkill = {
	id: "tool-skill",
	name: "@deepseek-ai/dsh-tool-skill"
};
const commandGoal = {
	id: "command-goal",
	name: "@deepseek-ai/dsh-command-goal"
};
const compaction = {
	id: "compaction",
	name: "cordis:group",
	group: true,
	isolate: {
		compaction: true,
		toolResultPruner: true
	},
	config: [
		{
			id: "compaction-basic",
			name: "@deepseek-ai/dsh-compaction-basic"
		},
		{
			id: "command-compact",
			name: "@deepseek-ai/dsh-command-compact"
		},
		{
			id: "tool-result-pruner",
			name: "@deepseek-ai/dsh-compaction-tool-result-pruner",
			config: {
				thresholdChars: 8192,
				headChars: 4096,
				tailChars: 1024
			}
		}
	]
};
const delegation = {
	id: "delegation",
	name: "cordis:group",
	group: true,
	isolate: { workflowEngine: true },
	config: [
		{
			id: "tool-subagent-control",
			name: "@deepseek-ai/dsh-tool-subagent-control"
		},
		{
			id: "tool-subagent",
			name: "@deepseek-ai/dsh-tool-subagent",
			config: {
				provider: "spawn",
				toolName: "subagent",
				modelSelection: true,
				modelDiscovery: true
			}
		},
		{
			id: "tool-subagent-fork",
			name: "@deepseek-ai/dsh-tool-subagent",
			config: {
				provider: "fork",
				toolName: "subagent_fork"
			}
		},
		{
			id: "workflow-ptc",
			name: "@deepseek-ai/dsh-workflow-ptc",
			disabled: true,
			config: { provider: "spawn" }
		},
		{
			id: "tool-workflow",
			name: "@deepseek-ai/dsh-tool-workflow",
			disabled: true
		}
	]
};
const toolTodo = {
	id: "tool-todo",
	name: "@deepseek-ai/dsh-tool-todo",
	config: { allowParallelInProgress: true }
};
const toolWeb = {
	id: "tool-web",
	name: "@deepseek-ai/dsh-tool-web",
	config: {
		fetch: true,
		searchTimeoutMs: 6e4
	}
};
const toolExecutorPtc = {
	id: "tool-executor-ptc",
	name: "@deepseek-ai/dsh-tool-executor-ptc"
};
const toolPresent = {
	id: "present",
	name: "@deepseek-ai/dsh-tool-present"
};
//#endregion
//#region src/ai/_shared/prompts/index.ts
function getManagerSystemPrompt() {
	return `你是某个仓库的项目编排。长驻，管这个仓库下所有任务。

当前工作目录就是这个仓库的克隆。你不需要克隆、切换分支或提交 —— 那些是 Worker 的事。

## 你管三件事

**派活。** 一张票该开跑时，create_worker。建 worktree、开分支、起会话一次性配好。
槽位满了就让它留在 queued，不要硬开 —— 硬开的后果是两个 Worker 抢同一个端口。

**看着。** Worker 的汇报会进你的收件箱。ready 说明能审了，failed 说明要重试，
dropped 说明这活不用做了。收工的时候留下 branch 和 worktree，那是唯一记录。

**收尾。** PR 合了、CI 绿了、人说行了，就把票推到 done。
合并和关闭**不会**产生新触发 —— 别等它，自己去看。

## 分支命名

\`nexus/<任务号>\`，例如 \`nexus/T-105\`。**末段必须是任务号**，
PR 归哪张票就是靠这个字符串比对，猜错就挂到别的票上了。

## 收件箱

每条消息处理完就 inbox_kill 掉，别留着。会话结束时会提示「你有 N 条消息未处理」，
那时候还有 pending 就是没干完。

消息的优先级：**ask 排最前**，因为提问方那条线停着。其余按到达顺序。

## 求助

Worker 问你的事，能自己答的就 answer。不该你决定的两条路：

- 问主编排 → escalate，问题原文不动，只换回答的人
- 问人 → 你没有 ask，只能 escalate 上去让主编排问

不要替人做决定。不要给一个「大概是这样」的答案让 Worker 去猜。

## 边界

**不写代码。** 你觉得改动只有两行、自己动手更快 —— 也不动手。
自己改的话没人 review，也没人知道改过。

**不跨项目。** 你的视野就是这个仓库。需要别的项目配合，报给主编排。

**不取消票。** 取消是人的决定。做不了就报 failed，让人看见。`;
}
function getSupervisorSystemPrompt() {
	return `你是临时协调者。你存在的唯一理由：
**一件事跨了两个以上项目，得有人在中间看。**

## 每次醒来的第一件事

调 list_tickets。**不要只信收件箱里那一条消息** —— 那条消息是别人转述的，
真实进度在票上。转述可能过时，票不会。

## 你协调什么

发现依赖关系、决定谁先做、把两边的结论对齐。

依赖写进库（link_dependency），不要记在脑子里 —— 你随时可能被重启，
而重启后没人知道你上次想到哪了。

## 你不做什么

**不改代码。** 需要改就让项目编排去派 Worker。

**不做产品决定。** 两边要求冲突、都说自己对的时候，往上问。

**不管收工。** 收工是插件按事实推导的，不是你的动作：

- 关联工单**全部 done** → 自动关停，你会直接消失，不用做任何事
- 有工单 **cancelled** → 插件通知主编排，由它决定关掉你、摘掉那张票、还是继续等

你不用判断「是不是差不多了」—— 这件事本来就轮不到会话判断。你的活是推进，
推进到没有依赖可理的时候，收尾自然会发生。

## 边界

你的视野是**这几张票之间**的关系，不是整个系统。
该看全局的是主编排，你只在被拉起来的那件事上有发言权。`;
}
function getWorkerSystemPrompt() {
	return `你是执行会话。当前工作目录是一个专属 worktree，
分支已经建好，只属于这一张票。

## 干活

改代码、跑测试、提 PR。做完用 report 说一声。

**不要**切分支、不要碰别人的 worktree、不要 force push。
这个 worktree 之外的一切都不归你管。

## 汇报与提问

\`report\` 说事实，发完继续干活：

| state | 什么时候用 |
| --- | --- |
| progress | 阶段性推进，值得说一句 |
| ready | 干完了，PR 已开 |
| failed | 干不了，说清卡在哪 |
| dropped | 这事不用做（复现不了、已被别人修了） |

\`ask\` 要一句话才能继续。**发完这条工作线就停下**，答案到了会重新 prompt 你。
能自己判断的不要 ask —— 你手上有仓库、有 CI、有历史，大部分事你自己就能定。

## 渠道

读原文用 read_channel，路径写法见对应的 \`nexus-channel-<id>\` skill。
要说话用 reply_channel，锚点是触发 id，不用猜发到哪。

**先回复再干活。** 人需要知道我们接下了。但只对真人请求回复 ——
CI 事件、自动化动作不需要你说「收到」。

## 恢复

如果醒来时发现自己有 recoveryNote，说明上次被重启打断了。
**先查目录、git 历史和远端，再决定要不要重做外部动作。**

重复开 PR、重复发评论是这类事故里最常见的一种。

## 后台任务

起了服务器、跑了长测试，回合结束前用 report 说清楚还在跑什么。
框架会让票继续占着槽位，最多 30 分钟。

不要留一个没人接的后台进程就结束 —— 那等于把烂摊子丢给下一个会话。`;
}
//#endregion
//#region src/ai/_shared/tools/channel.ts
const read_channel = defineTool({
	name: "read_channel",
	description: "读渠道原文，靠 resource 路径前缀分发。返回 { items, next_offset, next_resource }，两条翻页轴都要跟完。",
	parameters: {
		resource: {
			type: "string",
			required: true,
			description: "资源路径，前缀决定分发：github/…、feishu/…、trigger/<id>、thread/<id>、ticket/<id>。"
		},
		offset: {
			type: "integer",
			description: "从上一次的 next_offset 续读；0 表示重读同一份快照的开头。"
		},
		limit: {
			type: "integer",
			description: "本次最多返回多少条；省略则用渠道默认值。"
		}
	},
	output: {
		schema: {
			type: "string",
			description: "本条资源的正文分片，末尾附 next_offset / next_resource。"
		},
		render: (_args, value) => [{
			type: "text",
			text: value
		}]
	},
	execute: async () => {
		throw new Error("read_channel 尚未实现");
	}
});
const reply_channel = defineTool({
	name: "reply_channel",
	description: "按触发在对应渠道发言。锚点是 triggerId，不用猜发到哪。排队成功不等于送达。",
	parameters: {
		triggerId: {
			type: "string",
			required: true,
			description: "要回复的那条触发 id；回复发到这条触发所在的渠道地址。"
		},
		text: {
			type: "string",
			required: true,
			description: "发言正文，像人话。渠道的上限由对应 skill 说明。"
		}
	},
	output: {
		schema: {
			type: "string",
			description: "入队结果，例如 queued 或具体状态。"
		},
		render: (_args, value) => [{
			type: "text",
			text: value
		}]
	},
	execute: async () => {
		throw new Error("reply_channel 尚未实现");
	}
});
//#endregion
//#region src/ai/_shared/tools/communicate.ts
const answer = defineTool({
	name: "answer",
	description: "回答下面升上来的 ask：填 answer，标 status=done，答案送回发起方。",
	parameters: {
		askId: {
			type: "string",
			required: true,
			description: "要回答的那条 ask 的 Inbox id。"
		},
		text: {
			type: "string",
			required: true,
			description: "答案正文。发起方会原样收到。"
		}
	},
	output: {
		schema: {
			type: "string",
			description: "是否已回送。"
		},
		render: (_args, value) => [{
			type: "text",
			text: value
		}]
	},
	execute: async () => {
		throw new Error("answer 尚未实现");
	}
});
//#endregion
//#region src/ai/_shared/tools/inbox.ts
const inbox_list = defineTool({
	name: "inbox_list",
	description: "列出自己收件箱里 status=pending 的消息，按 createdAt 升序。",
	parameters: { detail: {
		type: "boolean",
		description: "true 时返回每条消息的正文；默认只给 id、kind 和一句话摘要。"
	} },
	output: {
		schema: {
			type: "string",
			description: "收件箱消息列表，每条一行。"
		},
		render: (_args, value) => [{
			type: "text",
			text: value
		}]
	},
	execute: async () => {
		throw new Error("inbox_list 尚未实现");
	}
});
const inbox_kill = defineTool({
	name: "inbox_kill",
	description: "把收件箱消息标为 done。不需要先读，可以批量。",
	parameters: { ids: {
		type: "array",
		items: { type: "string" },
		required: true,
		description: "要标为 done 的收件箱 id 列表。"
	} },
	output: {
		schema: {
			type: "string",
			description: "实际标为 done 的条数。"
		},
		render: (_args, value) => [{
			type: "text",
			text: value
		}]
	},
	execute: async () => {
		throw new Error("inbox_kill 尚未实现");
	}
});
//#endregion
//#region src/ai/_shared/tools/ticket.ts
/**
* 派票给项目编排。主编排和 Supervisor 都用这一份：
* 两者都是「让某个项目编排就这张票做事」，写的也是同一条 Inbox。
*
* **不收 projectId。** 项目归属记在 `Ticket.projectId` 上，由 ticketId 推出 ——
* 再传一次只会多一个能和库里的值对不上的参数。
*/
const dispatch_ticket = defineTool({
	name: "dispatch_ticket",
	description: "把票派给它的项目编排：写一条 Inbox(type=project, kind=ticket)。",
	parameters: {
		ticketId: {
			type: "string",
			required: true,
			description: "要派下去的票。归属由票自己决定，不用另外传项目。"
		},
		message: {
			type: "string",
			description: "附带给该项目编排的话。派新票时可省；只是提醒或调整时，写清楚要它做什么 —— 只说场景和约束，不要附实现方案。"
		}
	},
	output: {
		schema: {
			type: "string",
			description: "派工结果。"
		},
		render: (_args, value) => [{
			type: "text",
			text: value
		}]
	},
	execute: async () => {
		throw new Error("dispatch_ticket 尚未实现");
	}
});
/**
* 给这张票的项目编排递一条信息：不派活、不改状态、不复活已终态的票。
*
* 和 `dispatch_ticket` 是一对：那个说「去干」，这个说「你知道就行」。
* 少了它，一句通报也只能走 dispatch —— 而 dispatch 会唤醒已结束的票，
* 一句「顺带说一下」就能把收工的活重新拉起来。
*
* 官方把它叫 `orchestrator_ticket_note`，原话是 "it grants no authority"。
*/
const note_ticket = defineTool({
	name: "note_ticket",
	description: "把在别处得到的事实告诉这张票的项目编排：只传信息，不给授权，不改任何状态。",
	parameters: {
		ticketId: {
			type: "string",
			required: true,
			description: "要通知的票。消息进它所属项目编排的收件箱。"
		},
		text: {
			type: "string",
			required: true,
			description: "要说的事实，一句话，例如「A 把接口改成了 Y」。只说发生了什么，不要写成任务要求或实现建议。"
		}
	},
	output: {
		schema: {
			type: "string",
			description: "投递结果。"
		},
		render: (_args, value) => [{
			type: "text",
			text: value
		}]
	},
	execute: async () => {
		throw new Error("note_ticket 尚未实现");
	}
});
//#endregion
//#region src/ai/manager/tools/communicate.ts
/**
* 项目编排的 `report`：能带 supervisorId。
* Worker 的 `report` 是另一个工具（没有 supervisorId，它不知道 Supervisor 存在），不要合并。
*/
const report$2 = defineTool({
	name: "report",
	description: "向上级报事实：状态 + 一句话摘要。发完继续，不等答复。",
	parameters: {
		state: {
			type: "string",
			enum: [
				"progress",
				"ready",
				"failed",
				"dropped"
			],
			required: true,
			description: "progress 在跑 / ready 干完了 / failed 失败了 / dropped 不用做了。"
		},
		summary: {
			type: "string",
			required: true,
			description: "一句话摘要。给机器和面板看，短。"
		},
		supervisorId: {
			type: "string",
			description: "本票在某个 Supervisor 下且进入终态时必须带，否则那边一直等。不带则报给主编排。"
		},
		ticketId: {
			type: "string",
			description: "只做溯源，写进 Inbox.ticketId，不参与路由。"
		}
	},
	output: {
		schema: {
			type: "string",
			description: "是否已投递。"
		},
		render: (_args, value) => [{
			type: "text",
			text: value
		}]
	},
	execute: async () => {
		throw new Error("report 尚未实现");
	}
});
/**
* 项目编排的 `ask`：能带 supervisorId。
* Worker 的 `ask` 是另一个工具（没有 supervisorId），不要合并。
*/
const ask$2 = defineTool({
	name: "ask",
	description: "向上级提问。发完这条工作线停下，答案到了会被 prompt 回来；会话本身继续处理别的票。",
	parameters: {
		question: {
			type: "string",
			required: true,
			description: "要上级回答的问题，一句话说清。"
		},
		supervisorId: {
			type: "string",
			description: "本票在某个 Supervisor 下时，问题直接进它，不再绕主编排。"
		},
		ticketId: {
			type: "string",
			description: "只做溯源，写进 Inbox.ticketId，不参与路由。"
		}
	},
	output: {
		schema: {
			type: "string",
			description: "ask 的 id 与投递去向。"
		},
		render: (_args, value) => [{
			type: "text",
			text: value
		}]
	},
	execute: async () => {
		throw new Error("ask 尚未实现");
	}
});
const escalate = defineTool({
	name: "escalate",
	description: "把一条已有的 ask 原样上交：问题文本不改，就地改 type 换处理者。",
	parameters: { askId: {
		type: "string",
		required: true,
		description: "要上交的那条 ask 的 Inbox id。"
	} },
	output: {
		schema: {
			type: "string",
			description: "上交后的处理者。"
		},
		render: (_args, value) => [{
			type: "text",
			text: value
		}]
	},
	execute: async () => {
		throw new Error("escalate 尚未实现");
	}
});
//#endregion
//#region src/ai/manager/tools/supervisor.ts
/**
* 项目编排的版本：本项目那张给明细，别人的只给数量。
* 主编排的 `supervisor_list` 是另一个工具（全部字段可见），不要合并。
*/
const supervisor_list$1 = defineTool({
	name: "supervisor_list",
	description: "看 Supervisor：本项目相关的给明细，其余只给数量。",
	parameters: { status: {
		type: "string",
		enum: ["active", "closed"],
		description: "只看在协调中的或已收工的；省略表示只看 active。"
	} },
	output: {
		schema: {
			type: "string",
			description: "本项目那一张展开全部字段；其他 Supervisor 只给条数。"
		},
		render: (_args, value) => [{
			type: "text",
			text: value
		}]
	},
	execute: async () => {
		throw new Error("supervisor_list 尚未实现");
	}
});
//#endregion
//#region src/ai/manager/tools/ticket.ts
/**
* 项目编排的版本：范围锁死在本项目。
* 没有 projectId 参数 —— 你只能看自己的票，这和主编排的全局 `list_ticket` 是两个工具。
*/
const list_ticket$2 = defineTool({
	name: "list_ticket",
	description: "列本项目的任务。判重时必看。",
	parameters: {
		status: {
			type: "string",
			enum: [
				"waiting",
				"queued",
				"running",
				"review",
				"done",
				"cancelled"
			],
			description: "只看某个状态；省略表示不含已终态的票。"
		},
		attentionOnly: {
			type: "boolean",
			description: "true 时只返回存在指向它的 pending ask 的票。"
		}
	},
	output: {
		schema: {
			type: "string",
			description: "本项目任务列表：id、标题、状态、PR 状态、有无 pending ask。"
		},
		render: (_args, value) => [{
			type: "text",
			text: value
		}]
	},
	execute: async () => {
		throw new Error("list_ticket 尚未实现");
	}
});
const link_ticket = defineTool({
	name: "link_ticket",
	description: "建一张工单到另一张工单的关联。限本项目；跨项目依赖由 Supervisor 的 link_dependency 记。",
	parameters: {
		ticketId: {
			type: "string",
			required: true,
			description: "发起关联的票，必须是本项目的。"
		},
		relatedId: {
			type: "string",
			required: true,
			description: "被指向的那张票。"
		},
		kind: {
			type: "string",
			enum: ["depends", "relates"],
			required: true,
			description: "depends 前置依赖：relatedId 没做完，ticketId 停在 waiting。relates 只是相关，谁都不等谁。"
		}
	},
	output: {
		schema: {
			type: "string",
			description: "关联结果。"
		},
		render: (_args, value) => [{
			type: "text",
			text: value
		}]
	},
	execute: async () => {
		throw new Error("link_ticket 尚未实现");
	}
});
const stop_ticket = defineTool({
	name: "stop_ticket",
	description: "按人的明确要求结单为 cancelled。必须绑一条 human=true 的触发 —— 停止是人的决定，不是编排的判断。",
	parameters: {
		ticketId: {
			type: "string",
			required: true,
			description: "要停的票。"
		},
		triggerId: {
			type: "string",
			required: true,
			description: "人说停的那条触发。必须是 human=true，否则拒绝。"
		},
		reason: {
			type: "string",
			description: "一句话说明为什么停，写进记录。"
		}
	},
	output: {
		schema: {
			type: "string",
			description: "结单结果。"
		},
		render: (_args, value) => [{
			type: "text",
			text: value
		}]
	},
	execute: async () => {
		throw new Error("stop_ticket 尚未实现");
	}
});
const retry_ticket = defineTool({
	name: "retry_ticket",
	description: "重开卡住的票：结束旧 Worker，开一个新的。只对还开着、卡在 failed 的票有效。",
	parameters: { ticketId: {
		type: "string",
		required: true,
		description: "要重开的票。已到终态的票不适用 —— 那张只能由插件在人类消息到达时复活。"
	} },
	output: {
		schema: {
			type: "string",
			description: "重开结果。"
		},
		render: (_args, value) => [{
			type: "text",
			text: value
		}]
	},
	execute: async () => {
		throw new Error("retry_ticket 尚未实现");
	}
});
//#endregion
//#region src/ai/manager/tools/worker.ts
const create_worker = defineTool({
	name: "create_worker",
	description: "给一张票开 Worker：建 worktree、切分支、起会话一次配好。并发满了就让它留在 queued。",
	parameters: {
		ticketId: {
			type: "string",
			required: true,
			description: "要开跑的票，必须是本项目的。"
		},
		branch: {
			type: "string",
			description: "分支名，省略则用 nexus/<任务号>。末段必须是任务号，PR 归哪张票就靠这个字符串比对。"
		}
	},
	output: {
		schema: {
			type: "string",
			description: "新 Worker 的 id、分支与 worktree 路径。"
		},
		render: (_args, value) => [{
			type: "text",
			text: value
		}]
	},
	execute: async () => {
		throw new Error("create_worker 尚未实现");
	}
});
const send = defineTool({
	name: "send",
	description: "往 Worker 会话里塞话。默认 queue；只有确定它正在做错、需要立刻止损才用 interrupt。",
	parameters: {
		workerId: {
			type: "string",
			required: true,
			description: "目标 Worker。"
		},
		text: {
			type: "string",
			required: true,
			description: "要说的话。"
		},
		mode: {
			type: "string",
			enum: [
				"queue",
				"interrupt",
				"reply"
			],
			required: true,
			description: "queue 排队一轮；interrupt 立刻打断并 steer；reply 回答它的 ask。"
		}
	},
	output: {
		schema: {
			type: "string",
			description: "投递结果。"
		},
		render: (_args, value) => [{
			type: "text",
			text: value
		}]
	},
	execute: async () => {
		throw new Error("send 尚未实现");
	}
});
const view = defineTool({
	name: "view",
	description: "读 Worker 会话正文，分片返回。这不是 report —— report 是结构化状态通道。",
	parameters: {
		workerId: {
			type: "string",
			required: true,
			description: "要读的 Worker。"
		},
		offset: {
			type: "integer",
			description: "从上次的 next_offset 续读；0 表示从头读。"
		}
	},
	output: {
		schema: {
			type: "string",
			description: "会话正文分片，末尾附 next_offset。"
		},
		render: (_args, value) => [{
			type: "text",
			text: value
		}]
	},
	execute: async () => {
		throw new Error("view 尚未实现");
	}
});
const cancel = defineTool({
	name: "cancel",
	description: "中止 Worker 当前回合。那一次回合一并作废。",
	parameters: {
		workerId: {
			type: "string",
			required: true,
			description: "要中止的 Worker。"
		},
		keepInbox: {
			type: "boolean",
			description: "true 时不清理它收件箱里的待处理消息；省略则一并清掉。"
		}
	},
	output: {
		schema: {
			type: "string",
			description: "中止结果。"
		},
		render: (_args, value) => [{
			type: "text",
			text: value
		}]
	},
	execute: async () => {
		throw new Error("cancel 尚未实现");
	}
});
const rename = defineTool({
	name: "rename",
	description: "改 Worker 会话的标题，方便在会话列表里认出来。",
	parameters: {
		workerId: {
			type: "string",
			required: true,
			description: "要改名的 Worker。"
		},
		title: {
			type: "string",
			required: true,
			description: "新标题。"
		}
	},
	output: {
		schema: {
			type: "string",
			description: "改名结果。"
		},
		render: (_args, value) => [{
			type: "text",
			text: value
		}]
	},
	execute: async () => {
		throw new Error("rename 尚未实现");
	}
});
//#endregion
//#region src/ai/manager/index.ts
const manager = definePreset({
	id: "manager",
	name: "Manager",
	description: "",
	instruction: getManagerSystemPrompt(),
	order: 5,
	tools: [
		read_channel,
		reply_channel,
		inbox_list,
		inbox_kill,
		report$2,
		ask$2,
		escalate,
		supervisor_list$1,
		list_ticket$2,
		link_ticket,
		stop_ticket,
		retry_ticket,
		create_worker,
		send,
		view,
		cancel,
		rename
	],
	plugins: [
		agentInstructions,
		compaction,
		commandGoal,
		delegation,
		skillFilesystem,
		timeContext,
		toolBash,
		toolExecutorPtc,
		toolFs,
		toolFsSearch,
		toolJobs,
		toolPresent,
		toolPwsh,
		toolSkill,
		toolTodo,
		toolWeb
	]
});
//#endregion
//#region src/ai/orchestrator/prompts/index.ts
function getOrchestratorSystemPrompt() {
	return `你是 Nexus 的主编排。全局只有一个，管所有项目。

## 你只管路由

你不写代码、不建分支、不碰仓库。你做的每个决定都是「这件事该归谁」：

- 话题归哪个项目 → 判一次，记下来，之后不再打扰你
- 一件事要不要开票 → 要，就开票派下去
- 跨项目卡住了 → 拉一个 Supervisor
- 只有人能拍板 → 问人

判断完就结束这一轮。不要盯着执行细节，那不是你的事。

## 判断顺序

收到触发后，按这个顺序走，**每一步都可能提前结束**：

1. **已经是老话题了吗** —— 用 list_ticket 看这条话题是否已挂在某张票上。
   挂了就别再判一次，那条触发会自动进对应项目的收件箱。
2. **需要开新票吗** —— 消息明确指向某张已有票 → attach_thread_to_ticket，
   不重复才 create_ticket。判重看「同一个改动意图」，不看措辞；只是相似不算指向。
3. **要不要人拍板** —— 涉及删数据、改 CI 配置、动权限、花钱，先 ask。
4. **派下去** —— dispatch_ticket 给项目编排。

## 三个边界

**不要什么都问人。** 你手上有完整上下文，能自己判断的自己判断。
问人的门槛是「我也不该知道」——权限、预算、产品取舍。不是「我不太确定」。

**不要重复开票。** 同一件事开两张票，两个 Worker 会改同一处代码，
冲突时谁也说不清该以谁为准。

**不要越过项目编排直接指挥 Worker。** 你连 Worker 的 id 都不该持有。

## 跨项目

两个以上项目互相等的时候才拉 Supervisor。判断标准很硬：
**一边的产出是另一边的输入，且都不是几分钟能完事的。**

单个项目内部的依赖不归 Supervisor 管 —— 项目编排自己会处理。

拉起来之后你就不管了，它收工时你会收到一条通知。

## 收尾

会话结束前看一眼 inbox_list。还有 pending 就说明这一轮没做完，
处理完再结束。不要留着自己也解释不清的未处理消息。`;
}
//#endregion
//#region src/ai/orchestrator/tools/communicate.ts
const ask_user = defineTool({
	name: "ask_user",
	description: "问人。只有主编排能问 —— 它是唯一能触达人类的一层。",
	parameters: {
		question: {
			type: "string",
			required: true,
			description: "要人回答的问题。写成人类听得懂的一句话，不要带技术黑话。"
		},
		triggerId: {
			type: "string",
			description: "问题发到哪个渠道；给了就锚在这条触发上，省略则只留在面板里。"
		}
	},
	output: {
		schema: {
			type: "string",
			description: "ask 的 id 与投递去向。"
		},
		render: (_args, value) => [{
			type: "text",
			text: value
		}]
	},
	execute: async () => {
		throw new Error("ask_user 尚未实现");
	}
});
//#endregion
//#region src/ai/orchestrator/tools/supervisor.ts
/**
* 主编排的版本：全部字段可见。
* 项目编排的 `supervisor_list` 是另一个工具（本项目那张给明细、别人的只给数量），不要合并。
*/
const supervisor_list = defineTool({
	name: "supervisor_list",
	description: "列全部 Supervisor，字段完整：标题、原因、状态、关联工单、各自进度。",
	parameters: { status: {
		type: "string",
		enum: ["active", "closed"],
		description: "只看在协调中的或已收工的；省略表示只看 active。"
	} },
	output: {
		schema: {
			type: "string",
			description: "Supervisor 列表，含 title / reason / status / 关联工单。"
		},
		render: (_args, value) => [{
			type: "text",
			text: value
		}]
	},
	execute: async () => {
		throw new Error("supervisor_list 尚未实现");
	}
});
const create_supervisor = defineTool({
	name: "create_supervisor",
	description: "跨项目时拉起一个临时协调者：建记录并起会话，把双方上下文写进开场。",
	parameters: {
		title: {
			type: "string",
			required: true,
			description: "一句话说明它在协调什么，例如「T-105 需要 B/x 配合」。"
		},
		reason: {
			type: "string",
			required: true,
			description: "为什么拉起来，写清卡在哪，方便事后回溯。"
		},
		ticketIds: {
			type: "array",
			items: { type: "string" },
			required: true,
			description: "它协调的那几张票，通常每个项目一张。"
		}
	},
	output: {
		schema: {
			type: "string",
			description: "新 Supervisor 的 id 与关联工单。"
		},
		render: (_args, value) => [{
			type: "text",
			text: value
		}]
	},
	execute: async () => {
		throw new Error("create_supervisor 尚未实现");
	}
});
const close_supervisor = defineTool({
	name: "close_supervisor",
	description: "关掉 Supervisor：status=closed，关联工单退回各自项目编排。reason 会原样进每个持票项目编排的收件箱。",
	parameters: {
		supervisorId: {
			type: "string",
			required: true,
			description: "要关掉的 Supervisor。"
		},
		reason: {
			type: "string",
			required: true,
			description: "为什么关。会原样进每个关联工单所属项目编排的收件箱 —— 它们要凭这句话决定那几张票接下来怎么办。写清是「做完了」还是「不做了、各自收摊」。"
		}
	},
	output: {
		schema: {
			type: "string",
			description: "关闭结果，含通知到哪几个项目编排。"
		},
		render: (_args, value) => [{
			type: "text",
			text: value
		}]
	},
	execute: async () => {
		throw new Error("close_supervisor 尚未实现");
	}
});
const attach_tickets_to_supervisor = defineTool({
	name: "attach_tickets_to_supervisor",
	description: "扩大 Supervisor 的范围：加关联工单，并自动通知该项目编排。",
	parameters: {
		supervisorId: {
			type: "string",
			required: true,
			description: "要扩范围的 Supervisor。"
		},
		ticketIds: {
			type: "array",
			items: { type: "string" },
			required: true,
			description: "要加进去的票。"
		}
	},
	output: {
		schema: {
			type: "string",
			description: "扩范围结果。"
		},
		render: (_args, value) => [{
			type: "text",
			text: value
		}]
	},
	execute: async () => {
		throw new Error("attach_tickets_to_supervisor 尚未实现");
	}
});
const detach_tickets_from_supervisor = defineTool({
	name: "detach_tickets_from_supervisor",
	description: "缩小 Supervisor 的范围：去掉关联工单，退回原项目，并自动通知该项目编排。**不取消** —— 取消是人的决定。",
	parameters: {
		supervisorId: {
			type: "string",
			required: true,
			description: "要缩范围的 Supervisor。"
		},
		ticketIds: {
			type: "array",
			items: { type: "string" },
			required: true,
			description: "要退回原项目的票。"
		},
		reason: {
			type: "string",
			required: true,
			description: "为什么摘出来。会进退回票所属项目编排的收件箱 —— 它要凭这句话知道那张票现在归谁管、还要不要继续等。"
		}
	},
	output: {
		schema: {
			type: "string",
			description: "缩范围结果，含通知到哪几个项目编排。"
		},
		render: (_args, value) => [{
			type: "text",
			text: value
		}]
	},
	execute: async () => {
		throw new Error("detach_tickets_from_supervisor 尚未实现");
	}
});
//#endregion
//#region src/ai/orchestrator/tools/thread.ts
const triage_thread = defineTool({
	name: "triage_thread",
	description: "给一条还没票跟着的话题定归属。判一次就固定，之后不再打扰主编排。",
	parameters: {
		threadId: {
			type: "string",
			required: true,
			description: "话题 id，形如 github:42 或 feishu:<chat>:<root>。"
		},
		action: {
			type: "string",
			enum: ["claim", "ignore"],
			required: true,
			description: "claim 归给某个项目；ignore 判为不用处理，之后不投递，除非有人又 @ 了我们。"
		},
		projectId: {
			type: "string",
			description: "action=claim 时必给：话题归哪个项目。"
		}
	},
	output: {
		schema: {
			type: "string",
			description: "写入后的 triage 结论。"
		},
		render: (_args, value) => [{
			type: "text",
			text: value
		}]
	},
	execute: async () => {
		throw new Error("triage_thread 尚未实现");
	}
});
const attach_thread_to_ticket = defineTool({
	name: "attach_thread_to_ticket",
	description: "让一张已有的票接管一条新话题：建订阅并投递。跨项目也走它。只有消息明确指向那张票才挂。",
	parameters: {
		ticketId: {
			type: "string",
			required: true,
			description: "接管这条话题的票。已被人叫停（cancelled）的票挂不上。"
		},
		threadId: {
			type: "string",
			required: true,
			description: "要挂上去的话题 id。"
		},
		note: {
			type: "string",
			description: "一句话路由背景或人给的约束，不要写实现建议，也不要复述原文。"
		}
	},
	output: {
		schema: {
			type: "string",
			description: "挂载结果。"
		},
		render: (_args, value) => [{
			type: "text",
			text: value
		}]
	},
	execute: async () => {
		throw new Error("attach_thread_to_ticket 尚未实现");
	}
});
const unlink_thread = defineTool({
	name: "unlink_thread",
	description: "摘掉挂错的话题，和 attach 严格对称：只删订阅一行，不动话题归属。",
	parameters: {
		ticketId: {
			type: "string",
			required: true,
			description: "要摘掉订阅的票。"
		},
		threadId: {
			type: "string",
			required: true,
			description: "要摘掉的话题 id。这张票的触发来源那条不许摘。"
		},
		reason: {
			type: "string",
			required: true,
			description: "一句话说明为什么不相关，写进记录供回溯。"
		}
	},
	output: {
		schema: {
			type: "string",
			description: "摘除结果。"
		},
		render: (_args, value) => [{
			type: "text",
			text: value
		}]
	},
	execute: async () => {
		throw new Error("unlink_thread 尚未实现");
	}
});
//#endregion
//#region src/ai/orchestrator/tools/ticket.ts
const create_ticket = defineTool({
	name: "create_ticket",
	description: "开一张票。任务一旦存在，projectId 就必须确定。",
	parameters: {
		title: {
			type: "string",
			required: true,
			description: "一句话说清要做什么，用发起方的语言。不要加需求、验收标准或实现建议。"
		},
		projectId: {
			type: "string",
			required: true,
			description: "这张票归哪个项目。"
		},
		threadIds: {
			type: "array",
			items: { type: "string" },
			required: true,
			description: "触发这张票的话题，至少一条。最早那条是「触发来源」。"
		},
		description: {
			type: "string",
			description: "需求正文，没有就省略。"
		}
	},
	output: {
		schema: {
			type: "string",
			description: "新票的 id 和状态。"
		},
		render: (_args, value) => [{
			type: "text",
			text: value
		}]
	},
	execute: async () => {
		throw new Error("create_ticket 尚未实现");
	}
});
/**
* 主编排的版本：全局可见，可以按项目过滤。
* 项目编排的 `list_ticket` 是另一个工具（没有 projectId，只看自己项目），不要合并。
*/
const list_ticket$1 = defineTool({
	name: "list_ticket",
	description: "列全部任务，可跨项目筛选。判重、找某张票的现状都靠它。",
	parameters: {
		status: {
			type: "string",
			enum: [
				"waiting",
				"queued",
				"running",
				"review",
				"done",
				"cancelled"
			],
			description: "只看某个状态；省略表示不含已终态的票。"
		},
		projectId: {
			type: "string",
			description: "只看某个项目的票。省略表示所有项目。"
		},
		attentionOnly: {
			type: "boolean",
			description: "true 时只返回存在指向它的 pending ask 的票 —— 也就是需要人介入的那些。"
		}
	},
	output: {
		schema: {
			type: "string",
			description: "任务列表，每张票一行：id、项目、标题、状态、PR 状态、有无 pending ask。"
		},
		render: (_args, value) => [{
			type: "text",
			text: value
		}]
	},
	execute: async () => {
		throw new Error("list_ticket 尚未实现");
	}
});
//#endregion
//#region src/ai/orchestrator/index.ts
const orchestrator = definePreset({
	id: "orchestrator",
	name: "Orchestrator",
	instruction: getOrchestratorSystemPrompt(),
	description: "",
	order: 4,
	tools: [
		read_channel,
		reply_channel,
		answer,
		inbox_list,
		inbox_kill,
		ask_user,
		supervisor_list,
		create_supervisor,
		close_supervisor,
		attach_tickets_to_supervisor,
		detach_tickets_from_supervisor,
		list_ticket$1,
		create_ticket,
		dispatch_ticket,
		note_ticket,
		triage_thread,
		attach_thread_to_ticket,
		unlink_thread
	],
	plugins: [
		agentInstructions,
		compaction,
		commandGoal,
		delegation,
		skillFilesystem,
		timeContext,
		toolBash,
		toolExecutorPtc,
		toolFs,
		toolFsSearch,
		toolJobs,
		toolPresent,
		toolPwsh,
		toolSkill,
		toolTodo,
		toolWeb
	]
});
//#endregion
//#region src/ai/supervisor/tools/index.ts
/**
* Supervisor 的 `list_ticket`：只看自己关联的那几张，无参数。
* 主编排的全局版、项目编排的本项目版都是另外的工具，不要合并。
*/
const list_ticket = defineTool({
	name: "list_ticket",
	description: "列自己关联的工单及其进度。每次醒来先看它 —— 不要只信收件箱里那一条转述。",
	parameters: {},
	output: {
		schema: {
			type: "string",
			description: "关联工单：id、项目、状态、prState、有无 pending ask。"
		},
		render: (_args, value) => [{
			type: "text",
			text: value
		}]
	},
	execute: async () => {
		throw new Error("list_ticket 尚未实现");
	}
});
const link_dependency = defineTool({
	name: "link_dependency",
	description: "记一条跨项目前置依赖。方向是「后来的指向先要做的」。别只记在脑子里 —— 你随时可能被重启。",
	parameters: {
		ticketId: {
			type: "string",
			required: true,
			description: "要等的那张票。"
		},
		dependsOn: {
			type: "string",
			required: true,
			description: "必须先做完的那张票。"
		}
	},
	output: {
		schema: {
			type: "string",
			description: "依赖记录结果。"
		},
		render: (_args, value) => [{
			type: "text",
			text: value
		}]
	},
	execute: async () => {
		throw new Error("link_dependency 尚未实现");
	}
});
const report$1 = defineTool({
	name: "report",
	description: "报给主编排，不等答复。",
	parameters: {
		state: {
			type: "string",
			enum: [
				"progress",
				"ready",
				"failed",
				"dropped"
			],
			required: true,
			description: "progress 在跑 / ready 做完了 / failed 失败了 / dropped 不用做了。"
		},
		summary: {
			type: "string",
			required: true,
			description: "一句话摘要。"
		}
	},
	output: {
		schema: {
			type: "string",
			description: "是否已投递。"
		},
		render: (_args, value) => [{
			type: "text",
			text: value
		}]
	},
	execute: async () => {
		throw new Error("report 尚未实现");
	}
});
const ask$1 = defineTool({
	name: "ask",
	description: "问主编排，这条线停下等答复。要加人、加项目、或需要上级拍板时用它。",
	parameters: { question: {
		type: "string",
		required: true,
		description: "要主编排回答的问题，一句话说清。"
	} },
	output: {
		schema: {
			type: "string",
			description: "ask 的 id。"
		},
		render: (_args, value) => [{
			type: "text",
			text: value
		}]
	},
	execute: async () => {
		throw new Error("ask 尚未实现");
	}
});
//#endregion
//#region src/ai/supervisor/index.ts
const supervisor = definePreset({
	id: "supervisor",
	name: "Supervisor",
	instruction: getSupervisorSystemPrompt(),
	description: "",
	order: 6,
	tools: [
		read_channel,
		answer,
		inbox_list,
		inbox_kill,
		dispatch_ticket,
		note_ticket,
		list_ticket,
		report$1,
		ask$1,
		link_dependency
	],
	plugins: [
		agentInstructions,
		compaction,
		commandGoal,
		delegation,
		skillFilesystem,
		timeContext,
		toolBash,
		toolExecutorPtc,
		toolFs,
		toolFsSearch,
		toolJobs,
		toolPresent,
		toolPwsh,
		toolSkill,
		toolTodo,
		toolWeb
	]
});
//#endregion
//#region src/ai/worker/tools/index.ts
/**
* Worker 的 `report`：没有 supervisorId。
* Worker 不知道 Supervisor 存不存在，也不该知道 —— 它只有一个去处：项目编排。
*/
const report = defineTool({
	name: "report",
	description: "报告进度。发完继续干活，不等回复。要对方动脑子的走 ask。",
	parameters: {
		state: {
			type: "string",
			enum: [
				"progress",
				"ready",
				"failed",
				"dropped"
			],
			required: true,
			description: "progress 在跑 / ready 干完了（PR 已开）/ failed 失败了 / dropped 不用做了。「我在等答复」不占状态位。"
		},
		summary: {
			type: "string",
			required: true,
			description: "一句话摘要，短。给机器和面板看，详细解释写正文。"
		}
	},
	output: {
		schema: {
			type: "string",
			description: "是否已投递。"
		},
		render: (_args, value) => [{
			type: "text",
			text: value
		}]
	},
	execute: async () => {
		throw new Error("report 尚未实现");
	}
});
/**
* Worker 的 `ask`：没有 supervisorId，只有一个去处 —— 项目编排。
* 项目编排的 `ask` 是另一个工具（能带 supervisorId），不要合并。
*/
const ask = defineTool({
	name: "ask",
	description: "问项目编排。发完这条工作线停下，等答案被 prompt 回来。不要一边问一边继续做。",
	parameters: { question: {
		type: "string",
		required: true,
		description: "要问的问题，一句话说清卡在哪。"
	} },
	output: {
		schema: {
			type: "string",
			description: "ask 的 id。"
		},
		render: (_args, value) => [{
			type: "text",
			text: value
		}]
	},
	execute: async () => {
		throw new Error("ask 尚未实现");
	}
});
//#endregion
//#region src/ai/index.ts
const agents = {
	manager,
	orchestrator,
	supervisor,
	worker: definePreset({
		id: "worker",
		name: "Worker",
		instruction: getWorkerSystemPrompt(),
		description: "",
		order: 7,
		tools: [
			read_channel,
			reply_channel,
			report,
			ask
		],
		plugins: [
			agentInstructions,
			compaction,
			commandGoal,
			delegation,
			skillFilesystem,
			timeContext,
			toolBash,
			toolExecutorPtc,
			toolFs,
			toolFsSearch,
			toolJobs,
			toolPresent,
			toolPwsh,
			toolSkill,
			toolTodo,
			toolWeb
		]
	})
};
//#endregion
//#region src/index.ts
const inject = [
	"agentPresets",
	"sessionController",
	"workspaceRegistry",
	"sessionQuery",
	"credentials"
];
async function apply(ctx) {
	const presets = ctx.get("agentPresets");
	ctx.effect(async () => {
		const processes = Object.values(agents).map((p) => presets?.register(p.preset));
		const unregisters = await Promise.all(processes);
		return () => Promise.all(unregisters);
	}, "nexus:presets");
	ctx.on("agent/created", async ({ agent }) => {
		const disposers = agents[agent.session.header.agentPreset].tools.map((t) => agent.ctx.tools.register(t));
		ctx.on("agent/disposed", ({ agent: disposedAgent }) => {
			disposedAgent === agent && disposers.forEach((d) => d());
		});
	});
}
//#endregion
export { apply, inject };
