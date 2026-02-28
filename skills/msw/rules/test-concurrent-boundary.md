---
title: 使用 `server.boundary()` 实现并发测试隔离
impact: HIGH
description: 将并发测试包装在 `server.boundary()` 中，以防止 `server.use()` 覆盖在并行测试之间泄漏。
tags: testing, concurrent, boundary, isolation, parallel
---

# 使用 `server.boundary()` 实现并发测试隔离

## 问题

`it.concurrent` 并行运行测试。没有 `server.boundary()`，一个并发测试中的 `server.use()` 会影响所有其他并发测试。

## 错误示例

```typescript
// BUG: 并发测试共享同一个服务器 — 覆盖泄漏
it.concurrent('显示管理员视图', async () => {
  server.use(
    http.get('/api/user', () => HttpResponse.json({ role: 'admin' }))
  )
  // 另一个并发测试可能会看到这个覆盖！
})

it.concurrent('显示成员视图', async () => {
  server.use(
    http.get('/api/user', () => HttpResponse.json({ role: 'member' }))
  )
  // 实际上可能从其他测试的覆盖中获取 'admin'
})
```

## 正确示例

```typescript
it.concurrent('显示管理员视图', server.boundary(async () => {
  server.use(
    http.get('/api/user', () => HttpResponse.json({ role: 'admin' }))
  )
  // 覆盖限定在此边界内 — 对其他测试不可见
}))

it.concurrent('显示成员视图', server.boundary(async () => {
  server.use(
    http.get('/api/user', () => HttpResponse.json({ role: 'member' }))
  )
  // 按预期获取 'member' — 边界防止泄漏
}))
```

## 原因

`server.boundary()` 创建一个隔离的处理器范围。在边界内通过 `server.use()` 添加的任何处理器仅对源自该边界执行上下文的请求可见。这对于 `it.concurrent` 和任何并行测试运行器都是必需的。
