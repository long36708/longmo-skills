---
title: 使用 `http` 命名空间替代 `rest`
impact: CRITICAL
description: MSW v2 将 `rest` 替换为 `http`。`rest` 命名空间已被完全移除。
tags: handler, namespace, http, rest, v2, migration
---

# 使用 `http` 命名空间替代 `rest`

## 问题

AI 助手和开发者经常从 v1 生成 `rest.get()`、`rest.post()` 模式。在 v2 中，`rest` 命名空间不存在 — 它已被 `http` 替换。

## 错误示例

```typescript
// BUG: 'rest' 在 v2 中不是从 'msw' 导出的
import { rest } from 'msw'

const handlers = [
  rest.get('/api/user', (req, res, ctx) => {
    return res(ctx.json({ name: 'John' }))
  }),
]
```

## 正确示例

```typescript
import { http, HttpResponse } from 'msw'

const handlers = [
  http.get('/api/user', () => {
    return HttpResponse.json({ name: 'John' })
  }),
]
```

## 原因

`rest` 命名空间在 MSW 2.0 中被移除。所有 HTTP 请求处理器现在都使用 `http` 命名空间。使用 `rest` 会在构建时产生导入错误。
