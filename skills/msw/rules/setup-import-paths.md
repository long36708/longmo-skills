---
title: 从正确的子路径导入服务器/工作器
impact: CRITICAL
description: 使用 `msw/node` 导入 setupServer，使用 `msw/browser` 导入 setupWorker。永远不要从 `msw` 导入这些。
tags: setup, import, node, browser, subpath
---

# 从正确的子路径导入服务器/工作器

## 问题

开发者从 `'msw'` 导入 `setupServer` 而不是从 `'msw/node'` 导入。顶级 `'msw'` 导出仅包含 `http`、`graphql`、`HttpResponse` 等。

## 错误示例

```typescript
// BUG: setupServer 不是从 'msw' 导出的
import { setupServer } from 'msw'
```

## 正确示例

```typescript
// Node.js (测试, SSR)
import { setupServer } from 'msw/node'

// 浏览器 (Storybook, 开发)
import { setupWorker } from 'msw/browser'

// 处理器和响应工具从 'msw' 导入
import { http, HttpResponse, graphql } from 'msw'
```

## 导入映射

| 导出 | 从何处导入 |
|--------|-------------|
| `http`, `graphql`, `HttpResponse`, `delay`, `bypass`, `passthrough` | `'msw'` |
| `setupServer` | `'msw/node'` |
| `setupWorker` | `'msw/browser'` |

## 原因

MSW v2 使用子路径导出以正确进行 tree-shaking。从 `'msw'` 导入 `setupServer` 会产生导入错误。这种分离确保浏览器代码不会捆绑 Node.js 依赖项，反之亦然。
