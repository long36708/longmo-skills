---
title: 使用 `graphql.link()` 将处理程序限定到特定端点
impact: MEDIUM
description: 当应用程序使用多个 GraphQL API 时，使用 `graphql.link(url)` 确保处理程序匹配正确的端点。
tags: graphql, link, scope, endpoint, multiple-apis
---

# 使用 `graphql.link()` 限定处理程序范围

## 问题

`graphql.query('GetUser', ...)` 匹配任何 GraphQL 端点。如果两个 API 具有相同的操作名称，处理程序会发生冲突。

## 错误示例

```typescript
// BUG: 在任何 GraphQL 端点上匹配 GetUser
graphql.query('GetUser', ({ variables }) => {
  return HttpResponse.json({
    data: { user: { id: variables.id, name: 'John' } },
  })
})
// 如果应用程序同时连接 /graphql 和 https://api.github.com/graphql，
// 这个处理程序会在两个端点上拦截 GetUser
```

## 正确示例

```typescript
const github = graphql.link('https://api.github.com/graphql')
const internal = graphql.link('/graphql')

const handlers = [
  github.query('GetUser', ({ variables }) => {
    return HttpResponse.json({
      data: { user: { login: variables.login, type: 'github' } },
    })
  }),
  internal.query('GetUser', ({ variables }) => {
    return HttpResponse.json({
      data: { user: { id: variables.id, type: 'internal' } },
    })
  }),
]
```

## 原因

`graphql.link(url)` 创建一个限定范围的处理器命名空间，仅匹配指定 URL 的请求。如果没有范围限定，跨不同 GraphQL API 的操作名称冲突会产生不可预测的模拟行为。
