# 迁移指南：MSW v1 到 v2

## 目录

- [导入变更](#导入变更)
- [处理器命名空间](#处理器命名空间)
- [解析器签名](#解析器签名)
- [响应构造](#响应构造)
- [请求属性变更](#请求属性变更)
- [GraphQL 变更](#graphql-变更)
- [生命周期事件变更](#生命周期事件变更)
- [已移除的 API](#已移除的-api)

## 导入变更

| v1 | v2 |
|----|-----|
| `import { rest } from 'msw'` | `import { http, HttpResponse } from 'msw'` |
| `import { setupServer } from 'msw/node'` | 相同（未变更） |
| `import { setupWorker } from 'msw'` | `import { setupWorker } from 'msw/browser'` |

```typescript
// 错误：v1 导入
import { rest } from 'msw'
import { setupWorker } from 'msw'

// 正确：v2 导入
import { http, HttpResponse } from 'msw'
import { setupWorker } from 'msw/browser'
```

## 处理器命名空间

`rest` 命名空间重命名为 `http`：

| v1 | v2 |
|----|-----|
| `rest.get(url, resolver)` | `http.get(url, resolver)` |
| `rest.post(url, resolver)` | `http.post(url, resolver)` |
| `rest.put(url, resolver)` | `http.put(url, resolver)` |
| `rest.patch(url, resolver)` | `http.patch(url, resolver)` |
| `rest.delete(url, resolver)` | `http.delete(url, resolver)` |
| `rest.all(url, resolver)` | `http.all(url, resolver)` |

## 解析器签名

最大的破坏性变更。v1 使用 `(req, res, ctx)` 三参数解析器。v2 使用单个对象参数并直接返回 `Response`。

```typescript
// 错误：v1 解析器
rest.get('/user', (req, res, ctx) => {
  return res(ctx.json({ name: 'John' }))dddddddddxxxxxxxxxxxxx
})

// 正确：v2 解析器
http.get('/user', ({ request, params, cookies }) => {
  return HttpResponse.json({ name: 'John' })
})
```

### v2 解析器信息对象

| 属性 | 类型 | 描述 |
|----------|------|-------------|
| `request` | `Request` | 标准 Fetch API Request |
| `params` | `Record<string, string>` | URL 路径参数 |
| `cookies` | `Record<string, string>` | 解析后的请求 cookies |
| `requestId` | `string` | 唯一请求标识符 |

## 响应构造

完整的 `ctx.*` 到 `HttpResponse.*` 映射：

| v1 | v2 |
|----|-----|
| `res(ctx.json(data))` | `HttpResponse.json(data)` |
| `res(ctx.text(str))` | `HttpResponse.text(str)` |
| `res(ctx.xml(str))` | `HttpResponse.xml(str)` |
| `res(ctx.body(str))` | `new HttpResponse(str)` |
| `res(ctx.status(code))` | `new HttpResponse(null, { status: code })` |
| `res(ctx.status(code), ctx.json(data))` | `HttpResponse.json(data, { status: code })` |
| `res(ctx.set(name, val))` | 包含在 `headers` 初始化选项中 |
| `res(ctx.cookie(name, val))` | `headers: { 'Set-Cookie': 'name=val' }` |
| `res(ctx.delay(ms), ctx.json(data))` | `await delay(ms); return HttpResponse.json(data)` |
| `res.once(ctx.json(data))` | `http.get(url, resolver, { once: true })` |
| `res.networkError(msg)` | `HttpResponse.error()` |
| `res(ctx.data({ user }))` | `HttpResponse.json({ data: { user } })` |
| `res(ctx.errors([...]))` | `HttpResponse.json({ errors: [...] })` |

### 完整的前后示例

#### 带状态的 JSON 响应

```typescript
// 错误：v1
rest.post('/api/user', (req, res, ctx) => {
  return res(ctx.status(201), ctx.json({ id: '1', name: 'John' }))
})

// 正确：v2
http.post('/api/user', () => {
  return HttpResponse.json({ id: '1', name: 'John' }, { status: 201 })
})
```

#### 自定义头部

```typescript
// 错误：v1
rest.get('/api/data', (req, res, ctx) => {
  return res(ctx.set('X-Request-Id', '123'), ctx.json({ value: 42 }))
})

// 正确：v2
http.get('/api/data', () => {
  return HttpResponse.json(
    { value: 42 },
    { headers: { 'X-Request-Id': '123' } },
  )
})
```

#### 延迟响应

```typescript
// 错误：v1
rest.get('/api/user', (req, res, ctx) => {
  return res(ctx.delay(1000), ctx.json({ name: 'John' }))
})

// 正确：v2
import { delay } from 'msw'

http.get('/api/user', async () => {
  await delay(1000)
  return HttpResponse.json({ name: 'John' })
})
```

#### 一次性响应

```typescript
// 错误：v1
rest.get('/api/data', (req, res, ctx) => {
  return res.once(ctx.json({ first: true }))
})

// 正确：v2
http.get('/api/data', () => {
  return HttpResponse.json({ first: true })
}, { once: true })
```

#### 网络错误

```typescript
// 错误：v1
rest.get('/api/data', (req, res, ctx) => {
  return res.networkError('Failed to connect')
})

// 正确：v2
http.get('/api/data', () => {
  return HttpResponse.error()
})
```

## 请求属性变更

| v1 (`req.*`) | v2 (`request` / 解析器信息) |
|-------------|-------------------------------|
| `req.url` | `new URL(request.url)` |
| `req.params` | `params`（来自解析器信息） |
| `req.cookies` | `cookies`（来自解析器信息） |
| `req.body` | `await request.json()`（异步！） |
| `req.headers.get(name)` | `request.headers.get(name)`（相同 API） |

### 读取请求体现在是异步的

```typescript
// 错误：v1（同步体访问）
rest.post('/api/user', (req, res, ctx) => {
  const { name } = req.body
  return res(ctx.json({ name }))
})

// 正确：v2（异步体访问）
http.post('/api/user', async ({ request }) => {
  const { name } = await request.json()
  return HttpResponse.json({ name })
})
```

### 读取 URL 和查询参数

```typescript
// 错误：v1
rest.get('/api/posts', (req, res, ctx) => {
  const page = req.url.searchParams.get('page')
  return res(ctx.json({ page }))
})

// 正确：v2
http.get('/api/posts', ({ request }) => {
  const url = new URL(request.url)
  const page = url.searchParams.get('page')
  return HttpResponse.json({ page })
})
```

## GraphQL 变更

```typescript
// 错误：v1
graphql.query('GetUser', (req, res, ctx) => {
  const { id } = req.variables
  return res(ctx.data({ user: { id, name: 'John' } }))
})

// 正确：v2
graphql.query('GetUser', ({ variables }) => {
  const { id } = variables
  return HttpResponse.json({
    data: { user: { id, name: 'John' } },
  })
})
```

| v1 | v2 |
|----|-----|
| `req.variables` | `variables`（来自解析器信息） |
| `req.operationName` | `operationName`（来自解析器信息） |
| `ctx.data(data)` | `HttpResponse.json({ data })` |
| `ctx.errors(errors)` | `HttpResponse.json({ errors })` |
| `ctx.extensions(ext)` | `HttpResponse.json({ extensions: ext })` |

## 生命周期事件变更

```typescript
// 错误：v1
server.on('request:start', (req) => {
  console.log(req.url.href)
})

// 正确：v2
server.events.on('request:start', ({ request, requestId }) => {
  console.log(request.url)
})
```

关键变更：
- 通过 `server.events` 访问事件而不是直接通过 `server`
- 事件负载是一个可解构的对象而不是位置参数
- `request` 是标准的 Fetch API `Request` 对象

## 已移除的 API

| 已移除的 API | 替代方案 |
|-------------|-------------|
| `rest` 命名空间 | `http` 命名空间 |
| `res()` 函数 | 直接返回 `HttpResponse` 或 `Response` |
| `ctx.*` 助手 | `HttpResponse.*` 静态方法 |
| `req.body`（同步） | `await request.json()`（异步） |
| `req.params` | 来自解析器信息的 `params` |
| `req.cookies` | 来自解析器信息的 `cookies` |
| `res.once()` | `{ once: true }` 处理器选项 |
| `res.networkError()` | `HttpResponse.error()` |
| `ctx.fetch()` | 使用原生 `fetch()` 与 `msw` 中的 `bypass()` |

### ctx.fetch() 到 bypass()

```typescript
// 错误：v1
rest.get('/api/user', async (req, res, ctx) => {
  const originalResponse = await ctx.fetch(req)
  const body = await originalResponse.json()
  return res(ctx.json({ ...body, extra: true }))
})

// 正确：v2
import { bypass } from 'msw'

http.get('/api/user', async ({ request }) => {
  const originalResponse = await fetch(bypass(request))
  const body = await originalResponse.json()
  return HttpResponse.json({ ...body, extra: true })
})
```
