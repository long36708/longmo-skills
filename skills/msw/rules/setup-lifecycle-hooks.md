---
title: 始终使用 beforeAll/afterEach/afterAll 生命周期模式
impact: CRITICAL
description: 在 beforeAll 中启动服务器，在 afterEach 中重置处理器，在 afterAll 中关闭服务器。缺少其中任何一个都会导致处理器在测试之间泄漏。
tags: setup, lifecycle, beforeAll, afterEach, afterAll, testing, leakage
---

# 始终使用 beforeAll/afterEach/afterAll 生命周期模式

## 问题

开发者只在 `beforeAll` 中调用 `server.listen()`，但忘记在 `afterEach` 中调用 `resetHandlers()`。这会导致通过 `server.use()` 添加的每个测试覆盖泄漏到后续测试中，创建不稳定的测试套件。

## 错误示例

```typescript
// BUG: 缺少 afterEach — 处理器在测试之间泄漏
import { server } from './mocks/node'

beforeAll(() => server.listen())
afterAll(() => server.close())

test('显示用户资料', async () => {
  // 这个覆盖会泄漏到下一个测试中！
  server.use(
    http.get('/api/user', () => HttpResponse.json({ name: 'Jane' }))
  )
  // ...
})

test('显示默认用户', async () => {
  // BUG: 仍然从上面泄漏的处理器获取 Jane
  // ...
})
```

## 正确示例

```typescript
import { server } from './mocks/node'

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

test('显示用户资料', async () => {
  server.use(
    http.get('/api/user', () => HttpResponse.json({ name: 'Jane' }))
  )
  // ...
})

test('显示默认用户', async () => {
  // 从 handlers.ts 获取默认处理器 — 覆盖已被重置
  // ...
})
```

## 生命周期钩子

| 钩子 | 方法 | 目的 |
|------|--------|---------|
| `beforeAll` | `server.listen()` | 开始拦截请求 |
| `afterEach` | `server.resetHandlers()` | 移除运行时覆盖，恢复初始处理器 |
| `afterAll` | `server.close()` | 停止拦截，清理 |

## 原因

`resetHandlers()` 移除通过 `server.use()` 添加的处理器，并恢复传递给 `setupServer()` 的初始处理器。没有它，每个测试的覆盖会持续存在，导致后续测试收到意外的响应。这是 MSW 测试不稳定的首要原因。
