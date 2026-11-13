/**
 * Nexus 面板的 HTTP 服务。
 *
 * 路由只做三件事：取参数、调 model、返回。**不写 SQL** —— 查询都在
 * `src/database/models/` 里，按表归属。
 *
 * 挂在宿主既有的 `ctx.webServer` 上，不额外起服务、不占端口。
 *
 * GenAPI 要求：`setup` 里只能有一句一句的 `app.method(...)`，不能有条件、循环、
 * 嵌套函数。所以每个 handler 都拆到 `routes/` 下的独立文件。
 */

import { defineWebServer } from 'dsh-h3'

export const server = defineWebServer((_app) => {
})
