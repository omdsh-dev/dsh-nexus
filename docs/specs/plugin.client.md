> 该文档已被固定，禁止修改

# 插件客户端架构规范 (Plugin Client Architecture Protocol)

> 本规范是 [通用软件开发规范与协议 (devlopment.md)][./devlopment.md](cite: 1) 在 **DeepSeek Harness 插件客户端半区（Browser Runtime）** 的具象化工程落地协议。所有插件的 `src/client` 实现必须严格遵循本规范。
> **姊妹协议**：[插件宿主端架构规范 (plugin.host.md)][./plugin.host.md](cite: 2) 与 [插件宿主端领域服务协议 (plugin.host.service.md)](./plugin.host.service.md)。两端共享 SSOT、零无用中间层与单向依赖流哲学[cite: 2]，但客户端使用 React 与浏览器生命周期词汇表。

---

## 一、 核心架构原则

1. **零无用中间层**
* `src/client/index.ts` 只做装配，不放状态、监听、初始化或请求[cite: 2]。
* 严禁建立纯转发的 barrel；`service/` 与 `utils/` 按文件名直接引用[cite: 2]。
* **禁止薄别名**：业务层必须直接调用 `apis/` 函数，不得建立改名转发函数。


2. **彻底删除与零包袱**
* 彻底删除旧注册写法、过渡包装与兼容 re-export[cite: 2]；重命名与搬迁统一使用 `git mv`[cite: 1, 2]。
* 注册函数统一使用 `register*` 前缀，**不保留 `install***`。


3. **单向依赖流**
* 依赖严格自上而下流动，严禁跨层反向依赖或同级环状引用[cite: 2]：

$$\text{client/index.ts} \longrightarrow \begin{bmatrix} \text{register/} \\ \text{hooks/} \\ \text{components/} \end{bmatrix} \longrightarrow \text{service/} \longrightarrow \begin{bmatrix} \text{apis/} \\ \text{store/} \end{bmatrix} \longrightarrow \text{dsh-tauri/client}$$