---
title: 使用 `HttpResponse` 替代原生 `Response` 进行 Cookie 模拟
impact: HIGH
description: '`HttpResponse` 支持 `Set-Cookie` 头。原生的 `Response` 构造函数禁止使用它们。'
tags: response, HttpResponse, cookies, Set-Cookie, forbidden-header
---

# 使用 `HttpResponse` 替代原生 `Response` 进行 Cookie 模拟

## 问题

原生的 `Response` 类在构造函数中禁止使用 `Set-Cookie` 头。使用带有 `Set-Cookie` 的 `new Response()` 会静默丢弃该头。

## 错误示例

```typescript
// BUG: Set-Cookie 是原生 Response 中的禁止响应头
http.get('/api/login', () => {
  return new Response(JSON.stringify({ success: true }), {
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': 'session=abc123; Path=/; HttpOnly',
    },
  })
})
// Set-Cookie 头被静默丢弃！
```

## 正确示例

```typescript
import { http, HttpResponse } from 'msw'

http.get('/api/login', () => {
  return HttpResponse.json(
    { success: true },
    {
      headers: {
        'Set-Cookie': 'session=abc123; Path=/; HttpOnly',
      },
    },
  )
})
```

## 何时使用哪种方式

对于不需要 `Set-Cookie` 的响应，您可以使用 `new Response()` 或 `HttpResponse`。两者都有效。当需要 cookie 或想要一致性时，请使用 `HttpResponse`。

## 原因

Fetch API 规范禁止在 `Response` 构造函数的 `Headers` 中使用 `Set-Cookie`。MSW 的 `HttpResponse` 扩展了 `Response`，但为模拟响应绕过了此限制，因为模拟 cookie 需要可测试。
