---
title: 强制转换陷阱 — 布尔字符串
impact: CRITICAL
description: z.coerce.boolean() 使用 JavaScript 的 Boolean()，这会使 "false" → true。请使用 z.stringbool()。
tags: coercion, boolean, forms, env-vars
---

# 强制转换陷阱 — 布尔字符串

## 问题

`z.coerce.boolean()` 将输入包装在 JavaScript 的 `Boolean()` 构造函数中。`Boolean("false")` 是 `true`，因为任何非空字符串都是真值。这会静默损坏表单数据和环境变量。

## 错误示例

```typescript
// BUG: Boolean("false") === true, Boolean("0") === true
const Settings = z.object({
  debug: z.coerce.boolean(),
  verbose: z.coerce.boolean(),
})

Settings.parse({ debug: "false", verbose: "0" })
// { debug: true, verbose: true } — 两者都是错误的！
```

## 正确示例

```typescript
// 正确: z.stringbool() 正确处理字符串布尔表示
const Settings = z.object({
  debug: z.stringbool(),
  verbose: z.stringbool(),
})

Settings.parse({ debug: "false", verbose: "0" })
// { debug: false, verbose: false }

// z.stringbool() 接受: "true"/"false", "1"/"0", "yes"/"no", "on"/"off"
// 拒绝其他任何值并产生验证错误
```

## 原因

`z.stringbool()` 是专门为表单、环境变量和查询参数中的字符串到布尔值转换而构建的。它理解常见的布尔值字符串表示。`z.coerce.boolean()` 应该只在您确实需要 JavaScript 真值语义时使用。
