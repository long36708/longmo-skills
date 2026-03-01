---
title: 使用组合重用模式
impact: MEDIUM
description: 定义模式一次。使用.pick()、.omit()、.partial()派生变体。
tags: composition, pick, omit, partial, DRY
---

# 使用组合重用模式

## 问题

在相关模式（创建、更新、响应）中重复字段定义会导致漂移。当字段更改时，只有某些模式得到更新。

## 错误做法

```typescript
// 错误：字段在模式间重复
const UserCreate = z.object({
  name: z.string(),
  email: z.email(),
  password: z.string().min(8),
})

const UserUpdate = z.object({
  name: z.string().optional(),
  email: z.email().optional(),
  // 忘记密码字段 - 漂移
})

const UserResponse = z.object({
  id: z.string(),
  name: z.string(),
  email: z.email(),
  createdAt: z.date(),
})
```

## 正确做法

```typescript
// 正确：单一源，派生变体
const User = z.object({
  id: z.string(),
  name: z.string(),
  email: z.email(),
  password: z.string().min(8),
  createdAt: z.date(),
})

const UserCreate = User.omit({ id: true, createdAt: true })
const UserUpdate = User.pick({ name: true, email: true }).partial()
const UserResponse = User.omit({ password: true })
```

## 为什么

`pick()`、`omit()`、`partial()` 和 `required()` 从基类派生新模式。对基类的更改会自动传播到所有派生模式。推断的类型也保持同步。
