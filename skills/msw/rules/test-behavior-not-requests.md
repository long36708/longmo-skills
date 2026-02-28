---
title: 测试应用程序行为，而不是请求机制
impact: HIGH
description: 断言 UI 变化、状态转换或返回值 — 而不是断言 fetch 是否以特定参数调用。
tags: testing, behavior, assertion, fetch, ui
---

# 测试应用程序行为，而不是请求机制

## 问题

断言 `fetch` 是否以特定参数调用测试的是实现细节，而不是行为。如果应用程序从 `fetch` 切换到 `axios`，即使行为相同，测试也会失败。

## 错误示例

```typescript
// BUG: 测试实现，而不是行为
test('用户登录', async () => {
  render(<LoginForm />)
  await userEvent.type(screen.getByLabelText('Email'), 'john@test.com')
  await userEvent.type(screen.getByLabelText('Password'), 'password')
  await userEvent.click(screen.getByRole('button', { name: 'Sign In' }))

  // 脆弱：测试应用程序如何获取，而不是发生了什么
  expect(fetch).toHaveBeenCalledWith('/api/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'john@test.com', password: 'password' }),
  })
})
```

## 正确示例

```typescript
test('用户登录', async () => {
  render(<LoginForm />)
  await userEvent.type(screen.getByLabelText('Email'), 'john@test.com')
  await userEvent.type(screen.getByLabelText('Password'), 'password')
  await userEvent.click(screen.getByRole('button', { name: 'Sign In' }))

  // 测试用户在登录后看到什么
  await waitFor(() => {
    expect(screen.getByText('Welcome, John!')).toBeInTheDocument()
  })
})
```

## 原因

MSW 在网络级别拦截请求，因此您的测试应关注可观察的结果：用户看到什么、状态如何变化、函数返回什么。这使得测试对 HTTP 客户端重构具有弹性，并且更易于阅读。
