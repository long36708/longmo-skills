---
title: Refine 用于验证，Transform 用于转换
impact: HIGH
description: 使用 .refine() 进行验证（返回布尔值），.transform() 进行形状转换（返回新值）。
tags: refine, transform, pipe, validation
---

# Refine 用于验证，Transform 用于转换

## 问题

使用 `.transform()` 进行验证（对无效输入抛出异常）或使用 `.refine()` 进行类型转换会混淆关注点并产生令人困惑的错误。

## 错误示例

```typescript
// BUG: 在 transform 中进行验证——抛出异常而不是返回 ZodError
const SafeInt = z.string().transform((val) => {
  const n = parseInt(val, 10)
  if (isNaN(n)) throw new Error("不是数字") // 绕过 Zod 错误
  return n
})
```

## 正确示例

```typescript
// 正确: 先验证，再转换
const SafeInt = z.string()
  .refine((val) => !isNaN(parseInt(val, 10)), {
    error: "必须是数字字符串",
  })
  .transform((val) => parseInt(val, 10))

// 更好: 使用 pipe 进行分阶段解析
const SafeInt = z.string()
  .pipe(z.coerce.number())
  .pipe(z.int())
```

## 原因

`.refine()` = "这个有效吗？"（返回布尔值，如果为 false 则添加问题）。`.transform()` = "转换这个值"（返回新值）。`.pipe()` = "使用模式 A 解析，然后将结果提供给模式 B。" 保持它们分离可以使模式可读、可组合，并且错误消息准确。
