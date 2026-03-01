---
title: 错误格式化函数
impact: HIGH
description: 使用z.treeifyError()处理嵌套，z.flattenError()处理表单。不是已弃用的z.formatError()。
tags: errors, formatting, treeify, flatten
---

# 错误格式化函数

## 问题

Zod v4用 `z.treeifyError()` 和 `z.flattenError()` 替换了 `z.formatError()`。使用已弃用的函数会给出不同的输出形状。

## 错误做法

```typescript
// BUG: 在v4中已弃用
const result = schema.safeParse(data)
if (!result.success) {
  const formatted = z.formatError(result.error) // 已弃用
}
```

## 正确做法

```typescript
const result = schema.safeParse(data)
if (!result.success) {
  // 用于扁平表单 - { formErrors: string[], fieldErrors: Record<string, string[]> }
  const flat = z.flattenError(result.error)
  // flat.fieldErrors.email → ["Invalid email"]

  // 用于嵌套结构 - 树镜像模式形状
  const tree = z.treeifyError(result.error)
  // tree.properties.address.properties.zip.errors → ["Required"]

  // 用于调试 - 人类可读的字符串
  const pretty = z.prettifyError(result.error)
  // "✖ Invalid email at «email»\n✖ Required at «address.zip»"
}
```

## 为什么

| 函数 | 输出 | 用例 |
|----------|--------|----------|
| `z.flattenError()` | `{ formErrors, fieldErrors }` | 扁平表单，简单的字段→错误映射 |
| `z.treeifyError()` | 嵌套树，匹配模式形状 | 深度嵌套表单，递归模式 |
| `z.prettifyError()` | 人类可读的字符串 | 日志记录，调试，CLI输出 |
