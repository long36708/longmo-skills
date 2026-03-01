---
title: "v4: 统一的 z.enum()"
impact: MEDIUM
description: 使用统一的 z.enum()，它现在直接接受TypeScript枚举。z.nativeEnum()已移除。
tags: migration, v4, enum, nativeEnum
---

# v4: 统一的 z.enum()

## 问题

Zod v3有单独的 `z.enum()`（字符串数组）和 `z.nativeEnum()`（TypeScript/JS枚举）。在v4中，`z.enum()` 处理两者。`z.nativeEnum()` 已移除。

## 错误做法

```typescript
// 错误：z.nativeEnum()在v4中已移除
enum Role {
  Admin = "admin",
  User = "user",
  Guest = "guest",
}

const RoleSchema = z.nativeEnum(Role) // 错误：z.nativeEnum不是函数
```

## 正确做法

```typescript
enum Role {
  Admin = "admin",
  User = "user",
  Guest = "guest",
}

// 正确：z.enum()现在直接接受TypeScript枚举
const RoleSchema = z.enum(Role)

// 仍然适用于字符串数组
const StatusSchema = z.enum(["active", "inactive", "pending"])
```

## 为什么

Zod v4统一了枚举处理。`z.enum()` 接受字符串字面量数组和TypeScript枚举（字符串或数字）。这是与v3的破坏性更改，在v3中它们是单独的函数。
