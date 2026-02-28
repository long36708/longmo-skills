# Response API 参考

## 目录

- [HttpResponse 类](#httpresponse-类)
- [静态方法](#静态方法)
- [响应初始化选项](#响应初始化选项)
- [Cookie 处理](#cookie-处理)
- [与原生 Response 的比较](#与原生-response-的比较)

## HttpResponse 类

`HttpResponse` 扩展了原生 `Response` 类。它可以在任何期望 `Response` 的地方使用，但增加了对禁止头部的支持，如 `Set-Cookie`。

```typescript
import { HttpResponse } from 'msw'
```

### 构造函数

```typescript
new HttpResponse(body?, init?)
```

- `body` — `string | Blob | ArrayBuffer | ReadableStream | FormData | null`
- `init` — `{ status?, statusText?, headers? }`

```typescript
// 带自定义状态的纯文本体
new HttpResponse('Not Found', { status: 404 })

// 无体
new HttpResponse(null, { status: 204 })

// 流式体
new HttpResponse(readableStream, {
  headers: { 'Content-Type': 'text/event-stream' },
})
```

## 静态方法

7 个用于常见响应类型的静态方法：

| 方法 | Content-Type | 描述 |
|--------|-------------|-------------|
| `HttpResponse.json(body, init?)` | `application/json` | JSON 响应 |
| `HttpResponse.text(body, init?)` | `text/plain` | 纯文本 |
| `HttpResponse.html(body, init?)` | `text/html` | HTML 内容 |
| `HttpResponse.xml(body, init?)` | `text/xml` | XML 内容 |
| `HttpResponse.formData(body, init?)` | `multipart/form-data` | 表单数据 |
| `HttpResponse.arrayBuffer(body, init?)` | （无） | 二进制数据 |
| `HttpResponse.error()` | （网络错误） | 网络失败 |

### HttpResponse.json()

```typescript
HttpResponse.json({ name: 'John', age: 30 })
HttpResponse.json({ name: 'John' }, { status: 201 })
HttpResponse.json({ error: 'Not found' }, { status: 404 })
HttpResponse.json([{ id: 1 }, { id: 2 }]) // 数组也可以
```

### HttpResponse.text()

```typescript
HttpResponse.text('Hello, world!')
HttpResponse.text('Created', { status: 201 })
```

### HttpResponse.html()

```typescript
HttpResponse.html('<h1>Hello</h1>')
HttpResponse.html('<!DOCTYPE html><html><body>Page</body></html>')
```

### HttpResponse.xml()

```typescript
HttpResponse.xml('<user><name>John</name></user>')
```

### HttpResponse.formData()

```typescript
const form = new FormData()
form.append('name', 'John')
form.append('avatar', new Blob(['...'], { type: 'image/png' }))
HttpResponse.formData(form)
```

### HttpResponse.arrayBuffer()

```typescript
const buffer = new ArrayBuffer(8)
HttpResponse.arrayBuffer(buffer)
```

### HttpResponse.error()

创建网络错误响应（`type: "error"`）。客户端收到 `TypeError: Failed to fetch`。

```typescript
HttpResponse.error()
// 无参数 — 网络错误没有体、状态或头部
```

## 响应初始化选项

所有静态方法和构造函数都接受一个可选的 init 对象：

```typescript
HttpResponse.json(
  { name: 'John' },
  {
    status: 201,
    statusText: 'Created',
    headers: {
      'X-Custom-Header': 'value',
      'Set-Cookie': 'token=abc; Path=/; HttpOnly',
    },
  },
)
```

### 相同名称的多个头部

```typescript
new HttpResponse(null, {
  headers: [
    ['Set-Cookie', 'session=abc'],
    ['Set-Cookie', 'theme=dark'],
  ],
})
```

## Cookie 处理

原生 `Response` 禁止在构造函数中使用 `Set-Cookie`。`HttpResponse` 绕过此限制：

```typescript
// 正确：HttpResponse 支持 Set-Cookie
new HttpResponse(null, {
  headers: { 'Set-Cookie': 'session=abc123' },
})

// 错误：原生 Response 静默丢弃 Set-Cookie
new Response(null, {
  headers: { 'Set-Cookie': 'session=abc123' },
})
```

### 多个 cookies

```typescript
new HttpResponse(null, {
  headers: [
    ['Set-Cookie', 'session=abc123; Path=/; HttpOnly'],
    ['Set-Cookie', 'theme=dark; Path=/'],
  ],
})
```

## 与原生 Response 的比较

| 特性 | `Response` | `HttpResponse` |
|---------|-----------|----------------|
| JSON 体 | 手动 `JSON.stringify` | `HttpResponse.json()` 自动序列化 |
| Content-Type | 必须手动设置 | 静态方法自动设置 |
| Set-Cookie | 禁止（静默丢弃） | 支持 |
| 网络错误 | 不可能 | `HttpResponse.error()` |
| 在 MSW 处理器中使用 | 是（除 cookies 外） | 是（完全支持） |
