> 该文档已固定，禁止修改。

# 插件宿主端架构规范 (Plugin Host Architecture Protocol)

> 本规范为 [devlopment.md](./devlopment.md) 在 **DeepSeek Harness 插件宿主端（Node Runtime）** 的落地协议。插件 `src/host` 实现必须严格遵守本规范。
> **服务层细则**见：[plugin.host.service.md](./plugin.host.service.md)（定义宏、动词白名单与签名铁律）。

---

## 一、 核心架构原则

* **零无用中间层**：`apply.ts` 只做装配接线，不写业务逻辑；禁止为 2~3 个文件建立纯转发的 `index.ts`；临时数据转换必须就地处理。
* **彻底删除与零包袱**：彻底清理废弃逻辑、兼容层与存根代码，严禁保留 `legacy`/`compat` 文件。文件移动/重命名统一使用 `git mv`。
* **单向依赖流**：

$$\text{apply.ts (装配)} \longrightarrow \begin{bmatrix} \text{server/routes/} \\ \text{tools/} \\ \text{events/} \\ \text{prompts/} \end{bmatrix} \longrightarrow \text{service/ (业务领域)} \longrightarrow \begin{bmatrix} \text{storage/} \\ \text{utils/} \end{bmatrix}$$

---

## 二、 结构范例 (`示例`)

```text
src/
├── index.ts                   # 平铺装配器
├── config/ (constants.ts, ...)
├── types/index.ts             # 仅跨多模块共享类型；单模块专属类型与其模块同目录同名
├── server/
│   ├── index.ts               # defineWebServer + 原生 app 方法注册
│   └── routes/                # handler 文件；URL 与方法由 index.ts 显式注册
├── ai/                        # 定义预设与预设工具
├── events/                    # 事件监听 (session-event.ts, tools-execute.ts)
├── service/                   # 业务领域服务 (文件名 = 导出标识符)
│   ├── worktree.ts            # 领域编排 (create/checkout/attach)
│   ├── ledger.ts              # 持久化 <Binding> (load/save/remove/list)
│   ├── cleaner.ts             # 长任务调度 (start/lookup/unsettled)
│   └── session-context.ts     # 只读推演 (resolve/peek)
└── utils/                     # 仅跨多模块共享纯函数 (git.ts, filesystem.ts)；单模块专属工具与其模块同目录同名

```

## 三、 核心层实现细则

**1. 装配总线 (`apply.ts`)**

* 仅包含声明式注册 (`ctx.tools.register()`、`ctx.on()`、`ctx.systemPrompt.*()`、`ctx.effect()`)。
* 超过 2 行的回调必须抽离至 `events/` 或 `prompts/`。禁止创建全局 `deps` 对象透传。

```typescript
import { server } from './server'

export function apply(ctx: HostContext): void {
  ctx.effect(() => server(ctx), 'plugin: routes')

  ctx.tools.register(createWorktreeTool())
  ctx.tools.register(checkoutWorktreeTool())
  ctx.on('session/event', (session, event) => handleSessionEvent(session, event))
  ctx.on('tools/execute', (exec, next) => handleToolsExecute(exec, next))
  ctx.systemPrompt.context(checkoutContextProvider)
  ctx.systemPrompt.section(worktreeSectionProvider)
}

```

## 四、 自检清单 (Checklist)

* [ ] **装配精简**：`apply.ts` 是否仅包含声明式注册（无逻辑内联/过度嵌套）？
* [ ] **状态收口**：内存 Map/Set 是否收拢于 `config/runtime.ts`？是否存在参数击穿透传？
* [ ] **服务约束**：领域服务是否使用 `defineService`（共享请求中间件除外）？文件名与导出标识符是否一致？方法名是否为该领域的动作动词且全仓无同义词混用？
* [ ] **路由纯度**：`server/routes/` 是否仅负责协议解析与 DTO 校验？无直接操作 `storage`/宿主对象/系统命令行为？
* [ ] **路由形态**：URL 是否为资源路径 + 标准方法（方法命名文件）；动作端点是否仅限 `POST /<资源>/<动作>`，
                  且路径里没有 `/create`、`/update`、`/delete`、`/save`、`/remove` 这类 CRUD 动作后缀？
* [ ] **工具解耦**：`utils/` 是否无状态、脱离业务上下文且未引入契约宏？
* [ ] **彻底清理**：废弃代码/兼容层/无用 `index.ts` 是否已清理？重命名是否使用 `git mv`？
* [ ] **工程校验**：`pnpm --filter <pkg> typecheck` 与 `test` 是否全绿通过？
