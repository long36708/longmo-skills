---
title: 永远不要在处理器 URL 谓词中包含查询参数
impact: CRITICAL
description: 处理器 URL 中的查询参数会静默地不匹配任何内容。应该在解析器内部从 `request.url` 读取它们。
tags: handler, url, query-params, predicate, silent-failure
---

# 永远不要在处理器 URL 谓词中包含查询参数

## 问题

开发者将查询参数放在处理器 URL 字符串中。MSW 在匹配之前会从 URL 中剥离查询参数，因此 `http.get('/post?id=1', ...)` 永远不会匹配任何请求。

## 错误示例

```typescript
// BUG: URL 谓词中的查询参数会被静默忽略
// 这个处理器永远不会匹配 '/post?id=1'
http.get('/post?id=1', () => {
  return HttpResponse.json({ id: 1, title: 'First Post' })
})
```

## 正确示例

```typescript
http.get('/post', ({ request }) => {
  const url = new URL(request.url)
  const id = url.searchParams.get('id')

  if (id === '1') {
    return HttpResponse.json({ id: 1, title: 'First Post' })
  }

  return HttpResponse.json({ error: 'Not found' }, { status: 404 })
})
```

## 原因

MSW 仅通过路径名匹配处理器。查询参数在匹配前被剥离。将它们包含在 URL 谓词中会创建一个静默永不匹配的处理器，这极难调试。
