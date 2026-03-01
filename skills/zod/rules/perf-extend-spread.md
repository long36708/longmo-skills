---
title: 对于大型模式，使用扩展而不是Extend
impact: MEDIUM
description: 对于大型模式，使用.shape的扩展语法而不是.extend()以减少编译时成本。
tags: performance, extend, spread, typescript
---

# 对于大型模式，使用扩展而不是Extend

## 问题

`.extend()` 在TypeScript级别创建一个新的模式类型，这在编译时是昂贵的。链接多个 `.extend()` 调用会加剧这种成本。

## 错误做法

```typescript
// 错误：每个.extend()创建一个新的TS类型 - 编译慢
const Base = z.object({ id: z.string(), created: z.date() })
const WithName = Base.extend({ name: z.string() })
const WithEmail = WithName.extend({ email: z.email() })
const WithRole = WithEmail.extend({ role: z.enum(["admin", "user"]) })
// 4个中间类型供TypeScript解析
```

## 正确做法

```typescript
const Base = z.object({ id: z.string(), created: z.date() })
const Extra = { name: z.string(), email: z.email(), role: z.enum(["admin", "user"]) }

// 正确：具有扩展的单个z.object - 一个类型实例化
const Full = z.object({ ...Base.shape, ...Extra })
```

## 为什么

`.extend()` 对于一次性扩展是好的。但是在构建大型类型层次结构时，扩展 `.shape` 保持编译时间可控。运行时行为是相同的 - 这纯粹是TypeScript编译器性能优化。
