---
title: 对用户输入使用safeParse()
impact: CRITICAL
description: 使用safeParse()而不是parse()来避免在无效输入时抛出错误。
tags: parsing, safeParse, error-handling, validation
---

# 对用户输入使用safeParse()

## 问题

`parse()` 在无效输入时抛出 `ZodError`。将其包装在try/catch中是冗长且容易出错的 - 你失去了区分成功/错误结果的能力，并可能捕获不相关的错误。

## 错误做法

```typescript
// BUG: try/catch冗长且捕获不相关的错误
function validateInput(data: unknown) {
  try {
    const result = UserSchema.parse(data)
    return { success: true, data: result }
  } catch (e) {
    if (e instanceof z.ZodError) {
      return { success: false, errors: e.errors }
    }
    throw e // 重新抛出非Zod错误
  }
}
```

## 正确做法

```typescript
function validateInput(data: unknown) {
  const result = UserSchema.safeParse(data)
  if (!result.success) {
    return { success: false, errors: result.error.issues }
  }
  return { success: true, data: result.data }
}
```

## 为什么

`safeParse()` 返回一个区分联合 `{ success: true, data } | { success: false, error }`。没有异常，没有try/catch，没有捕获不相关错误的风险。只有当无效数据真正异常时才使用 `parse()`（例如，内部配置，应该永远不会出错）。
