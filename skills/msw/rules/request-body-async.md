---
title: 始终使用 Await 读取请求体方法
impact: HIGH
description: 在 v2 中，请求体通过异步 Fetch API 方法读取 — `await request.json()`、`await request.text()`、`await request.formData()`。
tags: request, body, async, await, json, formData
---

# 始终使用 Await 读取请求体方法

## 问题

v1 自动解析请求体。在 v2 中，`request` 是一个标准的 Fetch API `Request` — 请求体读取始终是异步的。

## 错误示例

```typescript
// BUG: request.body 是 ReadableStream，不是解析后的数据
http.post('/api/user', ({ request }) => {
  const body = request.body // ReadableStream，不是解析后的请求体！
  return HttpResponse.json({ received: body })
})
```

## 正确示例

```typescript
http.post('/api/user', async ({ request }) => {
  const body = await request.json()
  return HttpResponse.json({ received: body })
})

// 其他请求体读取方法：
// await request.text()
// await request.formData()
// await request.arrayBuffer()
// await request.blob()
```

## 请求体读取方法

| 方法 | 返回 | 用途 |
|--------|---------|---------|
| `await request.json()` | 解析后的对象 | JSON 载荷 |
| `await request.text()` | 字符串 | 纯文本，HTML |
| `await request.formData()` | `FormData` | 表单提交，文件上传 |
| `await request.arrayBuffer()` | `ArrayBuffer` | 二进制数据 |
| `await request.blob()` | `Blob` | 带 MIME 类型的二进制数据 |

## 原因

v2 使用标准的 Fetch API `Request` 对象。请求体读取方法返回 Promise，因为请求体是一个流。解析器在读取请求体时必须是 `async` 或返回 Promise。
