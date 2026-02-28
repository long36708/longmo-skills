---
title: 设置 `onUnhandledRequest: 'error'` 以捕获缺失的处理器
impact: HIGH
description: 配置服务器在未处理的请求上抛出错误，以便缺失的处理器使测试大声失败，而不是静默通过。
tags: testing, unhandled, error, configuration, strictness
---

# 设置 `onUnhandledRequest: 'error'`

## 问题

默认的 `onUnhandledRequest` 行为是 `'warn'` — 意外的请求打印警告但静默传递到实际网络。即使处理器缺失，测试也会通过。

## 错误示例

```typescript
// 默认：未处理的请求产生控制台警告并传递通过
const server = setupServer(...handlers)
server.listen() // 默认：{ onUnhandledRequest: 'warn' }

// 如果您忘记为 /api/settings 添加处理器，测试会静默地
// 命中真实 API（或由于网络错误而失败，而不是清晰的消息）
```

## 正确示例

```typescript
const server = setupServer(...handlers)

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' })
})

// 现在缺失的处理器会抛出：
// [MSW] Error: intercepted a request without a matching request handler:
//   GET /api/settings
// 这会立即使测试失败，并显示清晰的错误消息。
```

## 选项

| 策略 | 行为 |
|----------|----------|
| `'warn'` (默认) | 控制台警告，请求传递通过 |
| `'error'` | 抛出错误，测试失败 |
| `'bypass'` | 静默，请求传递通过 |
| `(request) => {}` | 用于条件处理的自定义函数 |

## 原因

`onUnhandledRequest: 'error'` 将缺失的处理器转换为具有清晰错误消息的立即测试失败。这会捕获 URL 中的拼写错误、忘记为新端点添加处理器以及测试期间意外的真实网络请求。
