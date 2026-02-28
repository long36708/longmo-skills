---
title: 使用 `server.use()` 进行每个测试的覆盖
impact: HIGH
description: 使用 `server.use()` 覆盖特定处理器以进行错误/边缘情况测试。永远不要修改共享处理器数组或为每个测试创建新服务器。
tags: testing, override, server.use, error, edge-case
---

# 使用 `server.use()` 进行每个测试的覆盖

## 问题

开发者要么修改共享处理器数组，为每个测试创建新服务器，要么将错误处理器放在全局处理器列表中。

## 错误示例

```typescript
// BUG: 为每个测试创建新服务器是浪费且容易出错
test('服务器故障时显示错误', async () => {
  const errorServer = setupServer(
    http.get('/api/user', () => new HttpResponse(null, { status: 500 }))
  )
  errorServer.listen()

  render(<UserProfile />)
  await waitFor(() => {
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
  })

  errorServer.close()
})
```

## 正确示例

```typescript
// 共享服务器，带有成功路径处理器（定义一次）
// import { server } from '../src/mocks/node'

test('服务器故障时显示错误', async () => {
  // 仅覆盖此测试所需的处理器
  server.use(
    http.get('/api/user', () => {
      return new HttpResponse(null, { status: 500 })
    })
  )

  render(<UserProfile />)
  await waitFor(() => {
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
  })
  // afterEach(() => server.resetHandlers()) 移除此覆盖
})
```

## 原因

`server.use()` 前置处理器，这些处理器优先于初始处理器。与 `afterEach(() => server.resetHandlers())` 结合使用，这为每个测试提供了一个隔离的覆盖，可以自动清理。一个共享服务器比多个服务器更有效。
