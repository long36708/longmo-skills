---
title: 使用 v2 解构解析器签名
impact: CRITICAL
description: v2 解析器接收一个单一对象 `{ request, params, cookies }` — 而不是 v1 的 `(req, res, ctx)` 三元组。
tags: handler, resolver, signature, v2, migration, destructuring
---

# 使用 v2 解构解析器签名

## 问题

v1 使用 `(req, res, ctx) => res(ctx.json(...))`。v2 使用带有 `request`、`params`、`cookies` 的单一信息对象。使用 v1 签名会导致运行时错误。

## 错误示例

```typescript
// BUG: v1 解析器签名 — 在 v2 中不工作
http.get('/api/user/:id', (req, res, ctx) => {
  const { id } = req.params
  return res(ctx.json({ id, name: 'John' }))
})
```

## 正确示例

```typescript
// v2 解析器接收一个单一信息对象
http.get('/api/user/:id', ({ request, params, cookies }) => {
  const { id } = params
  return HttpResponse.json({ id, name: 'John' })
})
```

## 解析器信息属性

| 属性 | 类型 | 描述 |
|----------|------|-------------|
| `request` | `Request` | 标准的 Fetch API Request 对象 |
| `params` | `Record<string, string>` | 来自 URL 模式的路径参数 |
| `cookies` | `Record<string, string>` | 解析后的请求 cookies |
| `requestId` | `string` | 唯一的请求标识符 |

## 原因

v2 与 Web 标准对齐。解析器接收 Fetch API `Request` 对象，而不是 MSW 的自定义 `req`。响应是标准的 `Response` 对象（或 `HttpResponse`），而不是通过 `res(ctx.*)` 组合的。
