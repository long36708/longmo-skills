---
title: 使用判别联合
impact: CRITICAL
description: 对带标签的对象联合使用 z.discriminatedUnion() 而不是 z.union()。
tags: union, discriminated, tagged, performance
---

# 使用判别联合

## 问题

`z.union()` 会顺序尝试每个分支，直到有一个匹配。对于具有共享判别字段（如 `type` 或 `kind`）的对象联合，这很慢并且会产生令人困惑的错误消息，显示每个分支的问题。

## 错误示例

```typescript
// 不好: 顺序尝试每个分支，错误显示所有分支的问题
const Shape = z.union([
  z.object({ type: z.literal("circle"), radius: z.number() }),
  z.object({ type: z.literal("square"), side: z.number() }),
  z.object({ type: z.literal("rect"), width: z.number(), height: z.number() }),
])
// 无效输入时的错误: "Invalid input"（无帮助 — 哪个分支失败了？）
```

## 正确示例

```typescript
// 正确: 使用判别器进行 O(1) 分发，有针对性的错误
const Shape = z.discriminatedUnion("type", [
  z.object({ type: z.literal("circle"), radius: z.number() }),
  z.object({ type: z.literal("square"), side: z.number() }),
  z.object({ type: z.literal("rect"), width: z.number(), height: z.number() }),
])
// 错误: "Invalid discriminator. Expected 'circle' | 'square' | 'rect'"
```

## 原因

`discriminatedUnion` 首先检查判别字段，然后只验证匹配的分支。这提供了 O(1) 的分发而不是 O(n) 的顺序检查，并且错误消息针对实际问题而不是列出每个分支的失败。
