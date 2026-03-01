---
title: 从模式推断类型
impact: CRITICAL
description: 使用z.infer<typeof Schema>获取输出类型。永远不要手动复制类型。
tags: inference, types, typescript, DRY
---

# 从模式推断类型

## 问题

手动定义TypeScript接口与Zod模式并行创建了会漂移的重复类型定义。当模式更改时，手动类型会被遗忘。

## 错误做法

```typescript
// BUG: 手动类型将与模式漂移
interface User {
  name: string
  email: string
  age: number
}

const UserSchema = z.object({
  name: z.string(),
  email: z.email(),
  age: z.number().min(0),
})

// 当模式更新时，这些可以静默地偏离
```

## 正确做法

```typescript
const UserSchema = z.object({
  name: z.string(),
  email: z.email(),
  age: z.number().min(0),
})

// 输出类型（解析/转换后）
type User = z.infer<typeof UserSchema>

// 输入类型（转换前 - 对表单有用）
type UserInput = z.input<typeof UserSchema>
```

## 为什么

`z.infer` 提取输出类型（转换后）。`z.input` 提取输入类型（转换前）。这些始终与模式保持同步。在大多数情况下使用 `z.infer`；当你需要预转换形状时使用 `z.input`（例如，表单状态，其中日期字段在转换为Date之前是字符串）。
