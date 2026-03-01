---
title: "v4: 统一错误参数"
impact: MEDIUM
description: 在所有地方使用v4错误参数。message、required_error、invalid_type_error、errorMap已移除。
tags: migration, v4, errors, message
---

# v4: 统一错误参数

## 问题

Zod v3有多种自定义错误的方式：`message`、`required_error`、`invalid_type_error` 和 `errorMap`。Zod v4用一个单一的 `error` 参数替换了所有这些。

## 错误做法

```typescript
// 错误：在v4中全部移除
const name = z.string({ required_error: "Required", invalid_type_error: "Not a string" })
const age = z.number().min(18, { message: "Too young" })
const email = z.email({ errorMap: myErrorMap })
```

## 正确做法

```typescript
// 正确：统一错误参数 - 字符串简写
const name = z.string({ error: "Name is required" })
const age = z.number().min(18, { error: "Must be 18 or older" })

// 正确：约束简写（字符串作为第二个参数）
const age2 = z.number().min(18, "Must be 18 or older")

// 正确：函数形式用于动态消息
const name2 = z.string({
  error: (issue) => {
    if (issue.input === undefined) return "Name is required"
    return "Name must be a string"
  },
})
```

## 为什么

统一的 `error` 参数简化了错误自定义。字符串形式涵盖了大多数情况。函数形式提供对问题上下文（`input`、`code`、`minimum` 等）的访问以获取动态消息。全局错误自定义使用带有错误映射函数的 `z.config()`。
