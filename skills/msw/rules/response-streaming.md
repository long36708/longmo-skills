---
title: 使用 ReadableStream 实现流式响应
impact: HIGH
description: 使用带有 HttpResponse 的 ReadableStream 主体来模拟流式传输（SSE、分块响应）。
tags: response, streaming, ReadableStream, SSE, event-stream
---

# 使用 ReadableStream 实现流式响应

## 问题

一些应用程序使用服务器发送事件（SSE）或分块传输。一次性返回整个请求体无法测试流式行为。

## 错误示例

```typescript
// 非流式 — 一次性返回整个请求体
http.get('/api/stream', () => {
  return HttpResponse.text('data: chunk1\n\ndata: chunk2\n\n', {
    headers: { 'Content-Type': 'text/event-stream' },
  })
})
```

## 正确示例

```typescript
import { http, HttpResponse, delay } from 'msw'

http.get('/api/stream', () => {
  const stream = new ReadableStream({
    async start(controller) {
      controller.enqueue(new TextEncoder().encode('data: chunk1\n\n'))
      await delay(100)
      controller.enqueue(new TextEncoder().encode('data: chunk2\n\n'))
      controller.close()
    },
  })

  return new HttpResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
})
```

## 原因

使用 `ReadableStream` 可以让您模拟真实的流式行为 — 数据块随时间到达，这对于测试进度指示器、增量渲染和 SSE 事件处理非常重要。一次性返回完整请求体会绕过这些代码路径。
