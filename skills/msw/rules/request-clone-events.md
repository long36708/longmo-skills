---
title: 在生命周期事件中读取请求体前先克隆请求
impact: HIGH
description: 在生命周期事件监听器中，读取请求体前始终先克隆请求。读取会消耗请求体流，破坏下游处理器。
tags: request, clone, events, body, stream
---

# 在生命周期事件中读取请求体前先克隆请求

## 问题

当您在生命周期事件处理器（如 `request:start`）中读取 `request.json()` 时，请求体流会被消耗。实际的请求处理器随后会得到空的请求体。

## 错误示例

```typescript
// BUG: 读取请求体会消耗流 — 处理器得到空请求体
server.events.on('request:start', async ({ request }) => {
  const body = await request.json()
  console.log('Request body:', body)
})
```

## 正确示例

```typescript
server.events.on('request:start', async ({ request }) => {
  const clone = request.clone()
  const body = await clone.json()
  console.log('Request body:', body)
})
```

## 原因

Fetch API `Request` 请求体是一个 `ReadableStream` — 一旦被读取，它就被消耗了。生命周期事件与处理器共享同一个 `Request` 对象。克隆创建一个具有自己请求体流的独立副本，因此事件监听器中的读取不会干扰处理器解析。
