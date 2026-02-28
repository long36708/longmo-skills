---
title: 理解 `bypass()` 与 `passthrough()` 的区别 — 它们不可互换
impact: MEDIUM
description: '`bypass()` 创建一个新的补充请求；`passthrough()` 将拦截的请求原样传递。'
tags: utility, bypass, passthrough, conditional, proxy
---

# `bypass()` vs `passthrough()`

## 问题

开发者经常混淆 `bypass()` 和 `passthrough()`。它们的功能完全不同。

## 错误用法

```typescript
// BUG: bypass() 创建一个新的请求 — 它不会"让这个请求通过"
import { bypass } from 'msw'

http.get('/api/user', ({ request }) => {
  // 错误：这会创建第二个请求，而不是让原始请求通过
  return bypass(request)
})
```

## 正确用法

```typescript
import { bypass, passthrough } from 'msw'

// passthrough() — 让原始拦截的请求到达实际服务器
http.get('/api/feature-flag', ({ request }) => {
  if (process.env.USE_REAL_FLAGS) {
    return passthrough()
  }
  return HttpResponse.json({ enabled: true })
})

// bypass() — 创建一个不会被拦截的附加请求
http.get('/api/user', async ({ request }) => {
  // 获取真实响应，然后修改它
  const realResponse = await fetch(bypass(request))
  const realData = await realResponse.json()

  return HttpResponse.json({
    ...realData,
    mockedField: 'extra-data',
  })
})
```

## 决策表

| 函数 | 创建新请求？ | 原始请求继续？ | 使用场景 |
|----------|---------------------|---------------------------|----------|
| `passthrough()` | 否 | 是 — 到达真实服务器 | 条件性模拟 |
| `bypass(request)` | 是 — 补充性 | 否 — 你处理响应 | 响应修补 / 代理 |

## 原因

`passthrough()` 用于条件性模拟 — "有时模拟，有时使用真实数据"。`bypass()` 用于响应增强 — "获取真实数据，然后在返回前修改"。错误使用它们会导致无限请求循环或意外的网络调用。
