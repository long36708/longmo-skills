---
title: 使用 `HttpResponse.error()` 模拟网络故障
impact: HIGH
description: 使用 `HttpResponse.error()` 模拟网络错误，而不是在解析器中抛出错误。
tags: response, error, network, HttpResponse.error
---

# 使用 `HttpResponse.error()` 模拟网络故障

## 问题

在解析器中抛出错误不会模拟网络故障 — 它会崩溃处理器。使用 `HttpResponse.error()`，它会在客户端产生 `TypeError: Failed to fetch`。

## 错误示例

```typescript
// BUG: 抛出错误会崩溃处理器 — 客户端得到未处理的错误，而不是网络故障
http.get('/api/data', () => {
  throw new Error('Network failure')
})
```

## 正确示例

```typescript
// 模拟网络错误 (TypeError: Failed to fetch)
http.get('/api/data', () => {
  return HttpResponse.error()
})
```

## 原因

`HttpResponse.error()` 创建一个 `type: "error"` 的 `Response`，Fetch API 会将其转换为 `TypeError: Failed to fetch`。这是应用程序在实际网络故障（DNS 错误、连接被拒绝等）期间真正看到的内容。在解析器中抛出错误是 MSW 内部的未处理异常。
