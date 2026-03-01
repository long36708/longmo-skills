---
title: 自定义错误消息（v4 API）
impact: HIGH
description: 使用v4错误参数（字符串或函数）。不是v3的required_error/invalid_type_error。
tags: errors, messages, v4, migration
---

# 自定义错误消息（v4 API）

## 问题

Zod v3的 `required_error`、`invalid_type_error` 和 `message` 参数在v4中已移除。使用它们静默地不会产生任何效果 - 你的自定义消息不会出现。

## 错误做法

```typescript
// BUG: v3 API - 这些参数在v4中已移除
const Name = z.string({
  required_error: "Name is required",
  invalid_type_error: "Name must be a string",
})

const Age = z.number().min(18, { message: "Must be 18+" })
```

## 正确做法

```typescript
// 正确：v4错误参数 - 字符串简写
const Name = z.string({ error: "Name is required" })
const Age = z.number().min(18, { error: "Must be 18+" })

// 正确：v4错误参数 - 用于动态消息的函数
const Name = z.string({
  error: (issue) =>
    issue.input === undefined
      ? "Name is required"
      : "Name must be a string",
})

// 正确：约束的字符串简写
const Age = z.number().min(18, "Must be 18+")
```

## 为什么

Zod v4将所有错误自定义统一到一个单一的 `error` 参数下，该参数接受字符串或接收问题的函数。函数形式让你可以访问 `issue.input`、`issue.code` 和其他上下文以获取动态消息。
