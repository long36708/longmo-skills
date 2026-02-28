---
title: 在测试中使用明确的毫秒数配合 `delay()`
impact: MEDIUM
description: '无参数的 `delay()` 在浏览器中使用真实的随机延迟，但在 Node.js 中是立即的（被取消）。使用 `delay(ms)` 以获得可预测的测试行为。'
tags: utility, delay, timing, node, browser, testing
---

# 使用明确的毫秒数配合 `delay()`

## 问题

在 Node.js 测试环境中，`await delay()` 什么都不做 — 它会立即解析。开发者期望有 200ms 的延迟并编写依赖于时间的断言。

## 错误示例

```typescript
// BUG: 无参数的 delay() 在 Node.js 中是立即的
http.get('/api/data', async () => {
  await delay() // 在 Node.js 中无操作 — 立即解析
  return HttpResponse.json({ data: 'loaded' })
})

// 测试期望看到加载状态但从未看到
test('显示加载指示器', async () => {
  render(<DataLoader />)
  // 加载指示器永远不会出现，因为响应是立即的
  expect(screen.getByRole('progressbar')).toBeInTheDocument() // 失败
})
```

## 正确示例

```typescript
http.get('/api/data', async () => {
  await delay(200) // 明确：总是等待 200ms，即使在 Node.js 中
  return HttpResponse.json({ data: 'loaded' })
})

// 用于测试超时：
http.get('/api/slow', async () => {
  await delay('infinite') // 永不解析 — 测试超时处理
  return HttpResponse.json({ data: 'never reached' })
})
```

## 不同环境下的延迟行为

| 用法 | 浏览器 | Node.js | 推荐 |
|-------|---------|---------|----------------|
| `delay()` | 随机真实延迟 | 立即（被取消） | 在测试中避免使用 |
| `delay(ms)` | 等待 `ms` 毫秒 | 等待 `ms` 毫秒 | 在测试中使用 |
| `delay('real')` | 随机真实延迟 | 随机真实延迟 | 模拟真实延迟 |
| `delay('infinite')` | 永不解析 | 永不解析 | 测试超时 |

## 原因

无参数的 `delay()` 设计用于浏览器模拟，您希望在测试中保持快速的同时获得真实的延迟感。在 Node.js 测试环境中，它被取消以保持测试速度。如果您的测试依赖于延迟（例如，测试加载状态），请始终指定明确的毫秒数。
