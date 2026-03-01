---
title: 用于分阶段解析的管道
impact: MEDIUM
description: 使用.pipe()链接验证阶段。解析字符串 → 强制转换为数字 → 验证范围。
tags: pipe, staged, coerce, chain
---

# 用于分阶段解析的管道

## 问题

在单个转换中完成多阶段强制转换和验证的复杂验证链变得混乱。每个阶段应该解析前一个阶段的输出。

## 错误做法

```typescript
// 错误：所有内容在一个transform中 - 没有中间验证
const PortNumber = z.string().transform((val) => {
  const n = parseInt(val, 10)
  if (isNaN(n)) throw new Error("Not a number") // 错误：不应该抛出
  if (n < 1 || n > 65535) throw new Error("Invalid port") // 错误：不应该抛出
  return n
})
```

## 正确做法

```typescript
// 正确：使用pipe进行分阶段解析
const PortNumber = z
  .string()
  .pipe(z.coerce.number()) // 阶段1：string → number
  .pipe(z.int().min(1).max(65535)) // 阶段2：验证范围

PortNumber.parse("8080") // 8080
PortNumber.parse("abc") // ZodError：阶段1失败
PortNumber.parse("99999") // ZodError：阶段2失败
```

## 为什么

`.pipe()` 将一个模式的输出馈送到另一个模式中。每个阶段在失败时产生适当的Zod错误。这比使用throws的手动转换更清晰，并且每个阶段的类型都正确推断。
