# Handler API 参考

## 目录

- [HTTP 处理器](#http-处理器)
- [GraphQL 处理器](#graphql-处理器)
- [URL 谓词](#url-谓词)
- [路径参数](#路径参数)
- [处理器选项](#处理器选项)
- [matchRequestUrl 工具函数](#matchrequesturl-工具函数)

## HTTP 处理器

`http` 命名空间上的所有方法：

| 方法 | 描述 |
|--------|-------------|
| `http.get(predicate, resolver, options?)` | GET 请求 |
| `http.post(predicate, resolver, options?)` | POST 请求 |
| `http.put(predicate, resolver, options?)` | PUT 请求 |
| `http.patch(predicate, resolver, options?)` | PATCH 请求 |
| `http.delete(predicate, resolver, options?)` | DELETE 请求 |
| `http.head(predicate, resolver, options?)` | HEAD 请求 |
| `http.options(predicate, resolver, options?)` | OPTIONS 请求 |
| `http.all(predicate, resolver, options?)` | 任何 HTTP 方法 |

### 签名

```typescript
http.get(
  predicate: string | RegExp | URL | ((input: { request: Request }) => boolean),
  resolver: (info: {
    request: Request
    params: Record<string, string | string[]>
    cookies: Record<string, string>
    requestId: string
  }) => Response | HttpResponse | undefined | void | Promise<...>,
  options?: { once?: boolean }
)
```

## GraphQL 处理器

| 方法 | 描述 |
|--------|-------------|
| `graphql.query(operationName, resolver)` | GraphQL 查询 |
| `graphql.mutation(operationName, resolver)` | GraphQL 变更 |
| `graphql.operation(resolver)` | 任何 GraphQL 操作 |
| `graphql.link(url)` | 特定端点的作用域命名空间 |

### GraphQL 解析器信息

```typescript
graphql.query('GetUser', ({
  query,           // DocumentNode — 解析后的 GraphQL 查询
  variables,       // Record<string, any> — 查询变量
  operationName,   // string — 操作名称
  request,         // Request — 标准 Fetch API Request
  cookies,         // Record<string, string>
  requestId,       // string
}) => {
  return HttpResponse.json({ data: { user: { id: variables.id } } })
})
```

## URL 谓词

### 字符串 — 精确路径名匹配

```typescript
http.get('/api/user', resolver)
```

### 带参数的字符串 — 捕获路径参数

```typescript
http.get('/api/user/:id', resolver)
```

### 通配符 — 匹配路径前缀

```typescript
http.get('/api/*', resolver) // 匹配 /api/anything
```

### 绝对 URL — 完整 URL 匹配

```typescript
http.get('https://api.example.com/user', resolver)
```

### 正则表达式 — 模式匹配

```typescript
http.get(/\/api\/user\/\d+/, resolver)
```

### 自定义函数 — 编程式匹配

```typescript
http.get(
  ({ request }) => {
    const url = new URL(request.url)
    return url.pathname.startsWith('/api') && url.searchParams.has('v')
  },
  resolver,
)
```

## 路径参数

### 单个参数

```typescript
http.get('/user/:id', ({ params }) => {
  const { id } = params // string
  return HttpResponse.json({ id })
})
```

### 多个参数

```typescript
http.get('/user/:userId/post/:postId', ({ params }) => {
  const { userId, postId } = params
  return HttpResponse.json({ userId, postId })
})
```

### 通配符参数

```typescript
http.get('/files/*', ({ params }) => {
  const path = params['*'] // /files/ 之后的所有内容
  return HttpResponse.json({ path })
})
```

## 处理器选项

### 一次性处理器

在第一次匹配请求后自动移除：

```typescript
http.get('/api/data', resolver, { once: true })
```

对于测试重试逻辑很有用 — 第一次请求失败，第二次成功：

```typescript
server.use(
  http.get('/api/data', () => new HttpResponse(null, { status: 500 }), { once: true })
)
// 第一次请求 → 500（一次性处理器已消耗）
// 第二次请求 → 默认处理器响应
```

## matchRequestUrl 工具函数

用于在处理器外部进行编程式 URL 匹配的工具函数：

```typescript
import { matchRequestUrl } from 'msw'

const match = matchRequestUrl(
  new URL('https://example.com/user/abc-123'),
  '/user/:id',
)

if (match) {
  console.log(match.params.id) // 'abc-123'
}
```
