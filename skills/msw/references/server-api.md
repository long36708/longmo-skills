# Server API 参考

## 目录

- [setupServer](#setupserver-nodejs)
- [setupWorker](#setupworker-browser)
- [Server 方法](#server-方法)
- [Worker 方法](#worker-方法)
- [生命周期事件](#生命周期事件)
- [onUnhandledRequest 策略](#onunhandledrequest-策略)
- [server.boundary()](#serverboundary)

## setupServer (Node.js)

```typescript
import { setupServer } from 'msw/node'
import { handlers } from './handlers'

const server = setupServer(...handlers)
```

用于 Node.js 环境：测试运行器（Vitest、Jest）、脚本和服务器端应用程序。

## setupWorker (Browser)

```typescript
import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

const worker = setupWorker(...handlers)
```

用于浏览器环境：开发服务器、Storybook、基于浏览器的测试。

## Server 方法

| 方法 | 描述 |
|--------|-------------|
| `.listen(options?)` | 开始拦截请求 |
| `.close()` | 停止拦截，清理 |
| `.use(...handlers)` | 前置运行时处理器（重写） |
| `.resetHandlers(...handlers?)` | 移除运行时处理器，可选替换初始处理器 |
| `.restoreHandlers()` | 将已使用的一次性处理器标记为未使用 |
| `.listHandlers()` | 返回所有活动处理器的数组 |
| `.boundary(callback)` | 为并发测试创建隔离的处理器作用域 |
| `.events` | 生命周期事件的 EventEmitter |

### .listen()

```typescript
server.listen()

// 带选项
server.listen({
  onUnhandledRequest: 'error',
})
```

### .close()

```typescript
server.close()
```

### .use()

前置运行时处理器，优先于初始处理器：

```typescript
server.use(
  http.get('/api/user', () => HttpResponse.json({ name: 'Override' }))
)
```

运行时处理器首先检查（最近添加的获胜）。它们会被 `resetHandlers()` 移除。

### .resetHandlers()

```typescript
// 移除所有运行时处理器，保留初始处理器
server.resetHandlers()

// 完全替换初始处理器
server.resetHandlers(
  http.get('/api/user', () => HttpResponse.json({ name: 'New default' }))
)
```

### .restoreHandlers()

恢复已使用的一次性处理器，使其可以再次触发：

```typescript
server.restoreHandlers()
```

### .listHandlers()

```typescript
const handlers = server.listHandlers()
console.log(handlers.length)
```

## Worker 方法

| 方法 | 描述 |
|--------|-------------|
| `.start(options?)` | 注册服务工作者，开始拦截 |
| `.stop()` | 注销服务工作者，停止拦截 |
| `.use(...handlers)` | 与 server 相同 |
| `.resetHandlers()` | 与 server 相同 |
| `.restoreHandlers()` | 与 server 相同 |
| `.listHandlers()` | 与 server 相同 |

### .start()

```typescript
await worker.start()

// 带选项
await worker.start({
  onUnhandledRequest: 'error',
  serviceWorker: {
    url: '/mockServiceWorker.js',
  },
  quiet: true, // 抑制 "[MSW] Mocking enabled" 控制台消息
})
```

### .stop()

```typescript
worker.stop()
```

## 生命周期事件

`server.events` / `worker.events` 上可用的 7 种事件类型：

| 事件 | 负载 | 描述 |
|-------|---------|-------------|
| `request:start` | `{ request, requestId }` | 请求被拦截 |
| `request:match` | `{ request, requestId }` | 找到处理器 |
| `request:unhandled` | `{ request, requestId }` | 未找到处理器 |
| `request:end` | `{ request, requestId }` | 请求处理完成 |
| `response:mocked` | `{ request, requestId, response }` | 发送模拟响应 |
| `response:bypass` | `{ request, requestId, response }` | 收到真实响应 |
| `unhandledException` | `{ request, requestId, error }` | 处理器抛出错误 |

### 订阅事件

```typescript
server.events.on('request:start', ({ request, requestId }) => {
  console.log('已拦截:', request.method, request.url)
})

server.events.on('response:mocked', ({ request, response }) => {
  console.log('已模拟:', request.url, response.status)
})

server.events.on('unhandledException', ({ request, error }) => {
  console.error('处理器错误:', request.url, error)
})
```

### 读取体前先克隆

```typescript
// 错误：消耗请求体，破坏下游处理器
server.events.on('request:start', async ({ request }) => {
  const body = await request.json()
})

// 正确：读取前先克隆
server.events.on('request:start', async ({ request }) => {
  const body = await request.clone().json()
})
```

### 移除事件监听器

```typescript
const listener = ({ request }) => {
  console.log(request.url)
}

server.events.on('request:start', listener)
server.events.removeListener('request:start', listener)

// 或移除所有监听器
server.events.removeAllListeners()
```

## onUnhandledRequest 策略

| 策略 | 行为 |
|----------|----------|
| `'warn'`（默认） | 控制台警告，请求通过 |
| `'error'` | 抛出错误，测试失败 |
| `'bypass'` | 静默，请求通过 |
| 自定义函数 | 条件处理 |

### 内置策略

```typescript
server.listen({ onUnhandledRequest: 'warn' })   // 默认
server.listen({ onUnhandledRequest: 'error' })   // 推荐用于测试
server.listen({ onUnhandledRequest: 'bypass' })  // 静默通过
```

### 自定义策略

```typescript
server.listen({
  onUnhandledRequest(request, print) {
    const url = new URL(request.url)

    // 忽略特定路径
    if (url.pathname.startsWith('/assets/')) {
      return
    }

    // 忽略特定主机
    if (url.hostname === 'cdn.example.com') {
      return
    }

    // 其他所有情况都报错
    print.error()
  },
})
```

## server.boundary()

为并行执行隔离处理器作用域。在边界内通过 `server.use()` 添加的处理器仅在该边界的执行上下文中可见。

```typescript
const isolated = server.boundary(async () => {
  server.use(
    http.get('/api/user', () => HttpResponse.json({ role: 'admin' }))
  )
  // 此重写仅在此边界内可见
})

await isolated()
```

### 与并发测试一起使用

```typescript
it.concurrent('admin flow', server.boundary(async () => {
  server.use(
    http.get('/api/me', () => HttpResponse.json({ role: 'admin' }))
  )
  // 仅此测试看到 admin 重写
}))

it.concurrent('guest flow', server.boundary(async () => {
  server.use(
    http.get('/api/me', () => HttpResponse.json({ role: 'guest' }))
  )
  // 仅此测试看到 guest 重写
}))
```
