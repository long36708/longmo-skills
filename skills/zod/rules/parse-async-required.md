---
title: 对异步精细化使用parseAsync
impact: CRITICAL
description: 当模式具有异步精细化或转换时，必须使用parseAsync()/safeParseAsync()。
tags: parsing, async, refinement, transform
---

# 对异步精细化使用parseAsync

## 问题

当模式包含异步精细化（`.refine(async ...)`）或异步转换（`.transform(async ...)`）时，调用同步的 `.parse()` 或 `.safeParse()` 会抛出错误。异步精细化不会执行。

## 错误做法

```typescript
const UniqueEmail = z.email().refine(
  async (email) => !(await db.users.exists({ email })),
  { error: "Email already registered" }
)

// BUG: 同步解析与异步精细化 - 抛出错误
const result = UniqueEmail.safeParse(input)
```

## 正确做法

```typescript
const UniqueEmail = z.email().refine(
  async (email) => !(await db.users.exists({ email })),
  { error: "Email already registered" }
)

// 正确：对具有异步精细化的模式使用safeParseAsync
const result = await UniqueEmail.safeParseAsync(input)
if (!result.success) {
  console.log(result.error.issues)
}
```

## 为什么

Zod分离了同步和异步解析。如果模式链中的任何精细化或转换是异步的，你必须使用 `parseAsync()` 或 `safeParseAsync()`。使用同步版本会抛出错误，而不是静默跳过 - 但如果你只测试快乐路径，这个错误在测试中很容易被忽略。
