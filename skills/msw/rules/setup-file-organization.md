---
title: 在 `src/mocks/` 中组织模拟文件，分离处理器、服务器和工作器文件
impact: CRITICAL
description: 将共享处理器保存在 `handlers.ts` 中，服务器设置在 `node.ts` 中，工作器设置在 `browser.ts` 中。避免在测试文件中使用内联处理器。
tags: setup, organization, handlers, node, browser, file-structure
---

# 在 `src/mocks/` 中组织模拟文件

## 问题

开发者在每个测试文件中内联定义处理器，重复模拟定义，使得无法在整个测试套件中维护一致的模拟行为。

## 错误示例

```typescript
// test/user.test.ts — 内联定义的处理器
const server = setupServer(
  http.get('/api/user', () => HttpResponse.json({ name: 'John' })),
  http.get('/api/posts', () => HttpResponse.json([])),
)

// test/posts.test.ts — 相同的处理器被重复
const server = setupServer(
  http.get('/api/user', () => HttpResponse.json({ name: 'John' })),
  http.get('/api/posts', () => HttpResponse.json([{ id: 1 }])),
)
```

## 正确示例

```
src/mocks/
├── handlers.ts    # 共享的成功路径处理器
├── node.ts        # 测试/SSR 的服务器设置
└── browser.ts     # Storybook/开发的工作器设置
```

```typescript
// src/mocks/handlers.ts
import { http, HttpResponse } from 'msw'

export const handlers = [
  http.get('/api/user', () => {
    return HttpResponse.json({ name: 'John' })
  }),
  http.get('/api/posts', () => {
    return HttpResponse.json([{ id: 1, title: 'First Post' }])
  }),
]

// src/mocks/node.ts
import { setupServer } from 'msw/node'
import { handlers } from './handlers'

export const server = setupServer(...handlers)

// src/mocks/browser.ts
import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

export const worker = setupWorker(...handlers)

// test/user.test.ts — 使用共享服务器，仅覆盖所需内容
import { server } from '../src/mocks/node'

test('显示错误状态', () => {
  server.use(
    http.get('/api/user', () => new HttpResponse(null, { status: 500 }))
  )
  // ...
})
```

## 原因

集中化处理器确保跨测试、Storybook 和开发的一致性模拟行为。`handlers.ts` 文件定义了成功路径的默认值；各个测试使用 `server.use()` 仅覆盖它们需要的端点以处理错误或边缘情况。这消除了重复，并使更新 API 模拟成为单文件更改。
