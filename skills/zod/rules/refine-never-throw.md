---
title: 精化函数中不要抛出异常
impact: HIGH
description: 精化和转换函数绝不能抛出异常。返回 false 或使用 ctx.addIssue()。
tags: refine, superRefine, throw, error
---

# 精化函数中不要抛出异常

## 问题

在 `.refine()` 或 `.transform()` 回调中抛出异常会绕过 Zod 的错误处理。异常不会被包装在 `ZodError` 中——它会崩溃解析操作并作为未处理的异常冒泡。

## 错误示例

```typescript
// BUG: 在 refine 中抛出异常会绕过 Zod 的错误处理
const PositiveNumber = z.number().refine((n) => {
  if (n <= 0) throw new Error("必须是正数") // 崩溃解析
  return true
})
```

## 正确示例

```typescript
// 正确: 从 refine 返回布尔值
const PositiveNumber = z.number().refine(
  (n) => n > 0,
  { error: "必须是正数" }
)

// 正确: 使用 superRefine 和 ctx.addIssue 处理复杂逻辑
const Password = z.string().superRefine((val, ctx) => {
  if (val.length < 8) {
    ctx.addIssue({
      code: "custom",
      message: "密码必须至少 8 个字符",
    })
  }
  if (!/[A-Z]/.test(val)) {
    ctx.addIssue({
      code: "custom",
      message: "密码必须包含大写字母",
    })
  }
})
```

## 原因

`.refine()` 期望返回布尔值（或异步的 Promise<boolean>）。使用 `ctx.addIssue()` 的 `.superRefine()` 允许每个字段有多个问题。两者都能与 Zod 的错误系统无缝集成——而抛出异常则不能。
