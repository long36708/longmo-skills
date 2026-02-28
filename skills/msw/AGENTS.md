# MSW v2 — 完整指南

> 本文档供AI代理和LLM在编写、审查或调试MSW（Mock Service Worker）处理器、服务器设置和测试模式时参考。它将所有规则和参考资料编译成一个可执行的指南。

**基准版本:** msw ^2.0.0

---

## 摘要

MSW（Mock Service Worker）是一个网络级的JavaScript/TypeScript API模拟库。它使用 `http` 和 `graphql` 命名空间拦截HTTP和GraphQL请求，通过 `HttpResponse` 返回模拟响应。在测试中，`setupServer`（来自 `msw/node`）在请求-客户端级别进行拦截；在浏览器中，`setupWorker`（来自 `msw/browser`）使用Service Worker。MSW v2完全移除了v1的 `rest` 命名空间、`res(ctx.*)` 响应组合和 `(req, res, ctx)` 解析器签名。本指南涵盖所有v2模式、测试最佳实践以及从v1迁移的内容。

---

## 目录

1. [处理器设计](#1-处理器设计) — 关键
2. [设置与生命周期](#2-设置与生命周期) — 关键
3. [请求读取](#3-请求读取) — 高
4. [响应构造](#4-响应构造) — 高
5. [测试模式](#5-测试模式) — 高
6. [GraphQL](#6-graphql) — 中等
7. [工具函数](#7-工具函数) — 中等

---

## 1. 处理器设计
**影响程度: 关键**

### 规则: 使用 `http` 命名空间代替 `rest`

`rest` 命名空间在 MSW 2.0 中被移除。所有 HTTP 处理器都使用 `http`。

```typescript
// 错误 — v2 中不存在 rest
import { rest } from 'msw'
rest.get('/api/user', (req, res, ctx) => res(ctx.json({ name: 'John' })))

// 正确
import { http, HttpResponse } from 'msw'
http.get('/api/user', () => HttpResponse.json({ name: 'John' }))
```

### 规则: 不要在处理器URL谓词中包含查询参数

MSW 仅按路径名匹配。URL谓词中的查询参数会被静默忽略。

```typescript
// 错误 — 静默匹配不到任何内容
http.get('/post?id=1', resolver)

// 正确 — 在解析器内部读取查询参数
http.get('/post', ({ request }) => {
  const url = new URL(request.url)
  const id = url.searchParams.get('id')
  return HttpResponse.json({ id })
})
```

### 规则: 使用 v2 的解构解析器签名

v2 解析器接收单个信息对象：`{ request, params, cookies, requestId }`。

```typescript
// 错误 — v1 三重签名
http.get('/api/user/:id', (req, res, ctx) => {
  return res(ctx.json({ id: req.params.id }))
})

// 正确 — v2 解构信息对象
http.get('/api/user/:id', ({ request, params, cookies }) => {
  return HttpResponse.json({ id: params.id })
})
```

解析器信息属性：

| 属性 | 类型 | 描述 |
|----------|------|-------------|
| `request` | `Request` | 标准 Fetch API Request 对象 |
| `params` | `Record<string, string>` | 来自URL模式的路径参数 |
| `cookies` | `Record<string, string>` | 解析后的请求cookies |
| `requestId` | `string` | 唯一的请求标识符 |

### 规则: 使用 `HttpResponse` 静态方法代替 `res(ctx.*)`

v2 使用通过 `HttpResponse` 构造的标准 `Response` 对象。

```typescript
// 错误 — res() 和 ctx 已被移除
http.get('/api/user', (req, res, ctx) => {
  return res(ctx.status(200), ctx.json({ name: 'John' }))
})

// 正确
http.get('/api/user', () => {
  return HttpResponse.json({ name: 'John' }, { status: 200 })
})
```

完整的 v1 到 v2 映射表：

| v1 模式 | v2 等效写法 |
|-----------|---------------|
| `res(ctx.json(data))` | `HttpResponse.json(data)` |
| `res(ctx.text(str))` | `HttpResponse.text(str)` |
| `res(ctx.xml(str))` | `HttpResponse.xml(str)` |
| `res(ctx.body(str))` | `new HttpResponse(str)` |
| `res(ctx.status(code))` | `new HttpResponse(null, { status: code })` |
| `res(ctx.set(name, val))` | 在 `headers` 初始化中包含 |
| `res(ctx.delay(ms), ...)` | `await delay(ms); return HttpResponse.json(...)` |
| `res(ctx.cookie(name, val))` | `headers: { 'Set-Cookie': 'name=val' }` |
| `res.networkError(msg)` | `HttpResponse.error()` |
| `res.once(...)` | `http.get(url, resolver, { once: true })` |

---

## 2. 设置与生命周期
**影响程度: 关键**

### 规则: 从正确的子路径导入 Server/Worker

```typescript
// 错误
import { setupServer } from 'msw'

// 正确
import { setupServer } from 'msw/node'    // Node.js (测试, SSR)
import { setupWorker } from 'msw/browser'  // 浏览器 (Storybook, 开发)
import { http, HttpResponse } from 'msw'   // 处理器和工具函数
```

| 导出 | 导入来源 |
|--------|-------------|
| `http`, `graphql`, `HttpResponse`, `delay`, `bypass`, `passthrough` | `'msw'` |
| `setupServer` | `'msw/node'` |
| `setupWorker` | `'msw/browser'` |

### 规则: 始终使用 beforeAll/afterEach/afterAll 生命周期模式

缺少 `afterEach(() => server.resetHandlers())` 会导致通过 `server.use()` 添加的处理器在测试之间泄漏。

```typescript
// 错误 — 处理器泄漏
beforeAll(() => server.listen())
afterAll(() => server.close())

// 正确
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
```

| 钩子 | 方法 | 目的 |
|------|--------|---------|
| `beforeAll` | `server.listen()` | 开始拦截请求 |
| `afterEach` | `server.resetHandlers()` | 移除运行时覆盖 |
| `afterAll` | `server.close()` | 停止拦截，清理 |

### 规则: 在 `src/mocks/` 中组织模拟文件

```
src/mocks/
├── handlers.ts    # 共享的成功路径处理器
├── node.ts        # setupServer(...handlers)
└── browser.ts     # setupWorker(...handlers)
```

```typescript
// src/mocks/handlers.ts
import { http, HttpResponse } from 'msw'

export const handlers = [
  http.get('/api/user', () => HttpResponse.json({ name: 'John' })),
  http.get('/api/posts', () => HttpResponse.json([{ id: 1, title: 'Post' }])),
]

// src/mocks/node.ts
import { setupServer } from 'msw/node'
import { handlers } from './handlers'
export const server = setupServer(...handlers)

// src/mocks/browser.ts
import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'
export const worker = setupWorker(...handlers)
```

---

## 3. 请求读取
**影响程度: 高**

### 规则: 在生命周期事件中读取请求体前先克隆请求

读取 `request.json()` 会消耗请求体流。在生命周期事件中，先克隆请求。

```typescript
// 错误 — 请求体被消耗，处理器获得空请求体
server.events.on('request:start', async ({ request }) => {
  const body = await request.json()
})

// 正确
server.events.on('request:start', async ({ request }) => {
  const body = await request.clone().json()
})
```

### 规则: 始终等待请求体读取方法

v2 使用标准的 Fetch API Request — 请求体读取始终是异步的。

```typescript
// 错误 — request.body 是一个 ReadableStream
http.post('/api/user', ({ request }) => {
  const body = request.body
})

// 正确
http.post('/api/user', async ({ request }) => {
  const body = await request.json()
})
```

| 方法 | 返回 | 用于 |
|--------|---------|---------|
| `await request.json()` | 解析后的对象 | JSON 负载 |
| `await request.text()` | 字符串 | 纯文本，HTML |
| `await request.formData()` | `FormData` | 表单提交 |
| `await request.arrayBuffer()` | `ArrayBuffer` | 二进制数据 |
| `await request.blob()` | `Blob` | 带 MIME 类型的二进制数据 |

---

## 4. 响应构造
**影响程度: 高**

### 规则: 使用 `HttpResponse` 进行 Cookie 模拟

原生 `Response` 禁止 `Set-Cookie` 头。`HttpResponse` 绕过了这个限制。

```typescript
// 错误 — Set-Cookie 被静默丢弃
new Response(null, { headers: { 'Set-Cookie': 'token=abc' } })

// 正确
new HttpResponse(null, { headers: { 'Set-Cookie': 'token=abc' } })
```

### 规则: 使用 `HttpResponse.error()` 模拟网络故障

```typescript
// 错误 — 抛出错误会使处理器崩溃
http.get('/api/data', () => { throw new Error('fail') })

// 正确 — 模拟 TypeError: Failed to fetch
http.get('/api/data', () => HttpResponse.error())
```

### 规则: 使用 ReadableStream 实现流式响应

```typescript
import { http, HttpResponse, delay } from 'msw'

http.get('/api/stream', () => {
  const stream = new ReadableStream({
    async start(controller) {
      controller.enqueue(new TextEncoder().encode('data: chunk1\n\n'))
      await delay(100)
      controller.enqueue(new TextEncoder().encode('data: chunk2\n\n'))
      controller.close()
    },
  })

  return new HttpResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
    },
  })
})
```

---

## 5. 测试模式
**影响程度: 高**

### 规则: 测试应用行为，而不是请求机制

```typescript
// 错误 — 测试实现细节
expect(fetch).toHaveBeenCalledWith('/api/login', expect.any(Object))

// 正确 — 测试可观察行为
await waitFor(() => {
  expect(screen.getByText('Welcome, John!')).toBeInTheDocument()
})
```

### 规则: 使用 `server.use()` 进行每测试覆盖

```typescript
test('显示错误状态', async () => {
  server.use(
    http.get('/api/user', () => new HttpResponse(null, { status: 500 }))
  )
  render(<UserProfile />)
  await waitFor(() => {
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
  })
})
```

### 规则: 使用 `server.boundary()` 实现并发测试隔离

```typescript
it.concurrent('管理员视图', server.boundary(async () => {
  server.use(
    http.get('/api/user', () => HttpResponse.json({ role: 'admin' }))
  )
  // 覆盖范围限于此边界内
}))

it.concurrent('成员视图', server.boundary(async () => {
  server.use(
    http.get('/api/user', () => HttpResponse.json({ role: 'member' }))
  )
  // 与管理员测试隔离
}))
```

### 规则: 设置 `onUnhandledRequest: 'error'`

```typescript
// 默认的 'warn' 会静默通过 — 缺少处理器不会导致测试失败
server.listen({ onUnhandledRequest: 'error' })
```

| 策略 | 行为 |
|----------|----------|
| `'warn'` (默认) | 控制台警告，请求通过 |
| `'error'` | 抛出错误，测试失败 |
| `'bypass'` | 静默，请求通过 |
| 自定义函数 | 条件性处理 |

---

## 6. GraphQL
**影响程度: 中等**

### 规则: 直接返回 `{ data }` / `{ errors }`

```typescript
// 错误 — v2 中移除了 ctx.data()
graphql.query('GetUser', (req, res, ctx) => res(ctx.data({ user: {} })))

// 正确
graphql.query('GetUser', ({ variables }) => {
  return HttpResponse.json({
    data: { user: { id: variables.id, name: 'John' } },
  })
})
```

### 规则: 使用 `graphql.link()` 处理多个端点

```typescript
const github = graphql.link('https://api.github.com/graphql')
const internal = graphql.link('/graphql')

const handlers = [
  github.query('GetUser', ({ variables }) => {
    return HttpResponse.json({ data: { user: { login: variables.login } } })
  }),
  internal.query('GetUser', ({ variables }) => {
    return HttpResponse.json({ data: { user: { id: variables.id } } })
  }),
]
```

---

## 7. 工具函数
**影响程度: 中等**

### 规则: `bypass()` 与 `passthrough()` — 不可互换

```typescript
import { bypass, passthrough } from 'msw'

// passthrough() — 让拦截的请求通过到真实服务器
http.get('/api/flags', () => {
  if (process.env.USE_REAL_FLAGS) return passthrough()
  return HttpResponse.json({ enabled: true })
})

// bypass() — 创建一个不会被拦截的附加请求
http.get('/api/user', async ({ request }) => {
  const real = await fetch(bypass(request))
  const data = await real.json()
  return HttpResponse.json({ ...data, extra: 'mocked' })
})
```

| 函数 | 创建新请求？ | 原始请求继续？ | 使用场景 |
|----------|---------------------|---------------------|----------|
| `passthrough()` | 否 | 是 | 条件性模拟 |
| `bypass(request)` | 是 | 否 | 响应修补 |

### 规则: 使用明确的毫秒数设置 `delay()`

```typescript
// 错误 — delay() 在 Node.js 中是立即的
await delay()

// 正确
await delay(200)          // 总是等待 200ms
await delay('infinite')   // 永不解析 — 测试超时处理
```

| 用法 | 浏览器 | Node.js |
|-------|---------|---------|
| `delay()` | 随机真实时间 | 立即（被忽略） |
| `delay(ms)` | 等待 `ms` 毫秒 | 等待 `ms` 毫秒 |
| `delay('real')` | 随机真实时间 | 随机真实时间 |
| `delay('infinite')` | 永不解析 | 永不解析 |
