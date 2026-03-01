---
title: 在不破坏消费者的情况下演进模式
impact: MEDIUM
description: 使用加法性更改进行非破坏性演进。新字段使用.optional()。没有重大版本升级，永远不要删除必需字段。
tags: architecture, versioning, backward-compatibility, api-evolution
---

# 在不破坏消费者的情况下演进模式

## 问题

在Zod模式中删除或收紧字段会静默地破坏消费者。因为 `z.object()` 默认会剥离未知键，删除的字段会从解析输出中消失而没有任何错误 - 消费者读取该字段在运行时会得到 `undefined`，尽管如果他们没有更新类型，TypeScript不会显示编译错误。

## 错误做法

```typescript
// v1 - 消费者依赖 `role`
const UserV1 = z.object({
  name: z.string(),
  email: z.email(),
  role: z.enum(["admin", "user"]),
  nickname: z.string(),
})

// v2 - 破坏性：删除了 `role`，消费者静默获得undefined
const UserV2 = z.object({
  name: z.string(),
  email: z.email(),
  nickname: z.string(),
  // role已消失 - 调用user.role的消费者获得undefined
})
```

## 正确做法

```typescript
// v2 - 非破坏性：保留role，添加displayName为可选，弃用nickname
const UserV2 = z.object({
  name: z.string(),
  email: z.email(),
  role: z.enum(["admin", "user"]),         // 保留 - 未删除
  nickname: z.string(),                     // 保留 - 在文档中弃用，在v3中删除
  displayName: z.string().optional(),       // 新增 - 可选，因此旧负载仍可解析
})

type UserV2 = z.infer<typeof UserV2>
```

## 决策表：模式更改

| 更改 | 破坏性？ | 安全方法 |
|--------|-----------|---------------|
| 添加可选字段 | 否 | `.optional()` - 旧数据仍可解析 |
| 添加必需字段 | **是** | 首先设为可选，在下一个主要版本中要求 |
| 删除字段 | **是** | 首先弃用，在下一个主要版本中删除 |
| 收紧约束（例如，min 1 → min 5） | **是** | 先前有效的数据现在失败 |
| 放宽约束（例如，min 5 → min 1） | 否 | 所有现有数据仍然有效 |
| 重命名字段 | **是** | 添加新名称作为可选，保留旧名称，迁移 |
| 更改类型（例如，string → number） | **是** | 使用新名称的新字段，弃用旧的 |
| 添加联合成员 | 否 | 现有数据仍然匹配 |
| 删除联合成员 | **是** | 具有该值的现有数据失败 |

## 为什么

Zod模式是运行时契约。更改它们与更改API具有相同的影响 - 依赖该形状的消费者将中断。加法性更改（新的可选字段、放宽的约束、新的联合成员）总是安全的。减法性更改（删除字段、收紧约束）需要所有消费者之间协调迁移。
