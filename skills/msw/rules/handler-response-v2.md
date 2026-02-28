---
title: 使用 `HttpResponse` 静态方法替代 `res(ctx.*)`
impact: CRITICAL
description: v2 使用 `HttpResponse.json()`、`HttpResponse.text()` 等方法。`res` 和 `ctx` 辅助函数已被移除。
tags: handler, response, HttpResponse, ctx, res, v2, migration
---

# 使用 `HttpResponse` 静态方法替代 `res(ctx.*)`

## 问题

v1 的响应组合 `res(ctx.status(200), ctx.json(...))` 在 v2 中不存在。响应现在是通过 `HttpResponse` 构造的标准 Response 对象。

## 错误示例

```typescript
// BUG: res() 和 ctx 在 v2 中被移除
http.get('/api/user', (req, res, ctx) => {
  return res(
    ctx.status(200),
    ctx.json({ name: 'John' }),
    ctx.set('X-Custom', 'value'),
  )
})
```

## 正确示例

```typescript
http.get('/api/user', () => {
  return HttpResponse.json(
    { name: 'John' },
    {
      status: 200,
      headers: { 'X-Custom': 'value' },
    },
  )
})
```

## v1 到 v2 响应映射

| v1 模式 | v2 等效方式 |
|-----------|---------------|
| `res(ctx.json(data))` | `HttpResponse.json(data)` |
| `res(ctx.text(str))` | `HttpResponse.text(str)` |
| `res(ctx.xml(str))` | `HttpResponse.xml(str)` |
| `res(ctx.status(code))` | `new HttpResponse(null, { status: code })` |
| `res(ctx.set(name, val))` | `new HttpResponse(body, { headers: { [name]: val } })` |
| `res(ctx.delay(ms), ...)` | `await delay(ms); return HttpResponse.json(...)` |
| `res(ctx.cookie(name, val))` | `HttpResponse.json(data, { headers: { 'Set-Cookie': '...' } })` |
| `res.networkError(msg)` | `HttpResponse.error()` |
| `res.once(...)` | `http.get(url, resolver, { once: true })` |

## 原因

v2 与 Fetch API 标准对齐。`HttpResponse` 扩展了原生的 `Response` 类，使模拟响应与实际响应保持一致，并支持诸如 `Set-Cookie` 头等功能。
