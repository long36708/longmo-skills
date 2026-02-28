---
title: 在 GraphQL 处理程序中直接返回 `{ data }` 和 `{ errors }`
impact: MEDIUM
description: v2 GraphQL 处理程序返回 `HttpResponse.json({ data: ... })` — v1 中的 `ctx.data()` 和 `ctx.errors()` 辅助函数已被移除。
tags: graphql, response, data, errors, v2, migration
---

# 直接返回 `{ data }` 和 `{ errors }`

## 问题

v1 使用 `res(ctx.data({ user: ... }))` 来处理 GraphQL 响应。在 v2 中，您需要通过 `HttpResponse.json()` 返回标准的 GraphQL 响应结构。

## 错误示例

```typescript
// BUG: ctx.data() 在 v2 中被移除
import { graphql } from 'msw'

graphql.query('GetUser', (req, res, ctx) => {
  return res(ctx.data({ user: { id: '1', name: 'John' } }))
})
```

## 正确示例

```typescript
import { graphql, HttpResponse } from 'msw'

// 成功响应
graphql.query('GetUser', ({ variables }) => {
  return HttpResponse.json({
    data: {
      user: { id: '1', name: 'John' },
    },
  })
})

// 错误响应
graphql.query('GetUser', () => {
  return HttpResponse.json({
    errors: [
      { message: '用户未找到' },
    ],
  })
})

// 部分数据带有错误
graphql.query('GetUser', () => {
  return HttpResponse.json({
    data: { user: null },
    errors: [
      { message: '未授权的字段访问' },
    ],
  })
})
```

## 原因

v2 移除了 GraphQL 特定的上下文工具。您需要直接构建标准的 GraphQL 响应结构（`{ data, errors, extensions }`）。这更加明确，并且与 GraphQL 服务器的实际响应方式保持一致。
