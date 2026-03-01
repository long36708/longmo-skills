---
title: 用于双向转换的编解码器
impact: MEDIUM
description: 使用z.codec()进行双向转换（例如，ISO字符串 ↔ 日期）。.transform()是单向的。
tags: codec, encode, decode, serialization
---

# 用于双向转换的编解码器

## 问题

`.transform()` 是单向的 - 它在解析期间将输入转换为输出。但是当你需要序列化数据回来时（例如，Date →
ISO字符串用于API响应），单向转换会丢失编码方向。

## 错误做法

```typescript
// 错误：transform是单向的 - 无法序列化回ISO字符串
const DateField = z.string().transform((s) => new Date(s))

// 解析工作："2024-01-01" → Date对象
// 但是你如何转换回"2024-01-01"用于API？
```

## 正确做法

```typescript
// 正确：编解码器定义了两个方向
const DateField = z.codec(z.iso.datetime(), z.date(), {
    decode: (s) => new Date(s), // string → Date（解析）
    encode: (d) => d.toISOString(), // Date → string（序列化）
})

const parsed = DateField.parse("2024-01-01T00:00:00Z") // Date对象
const serialized = DateField.encode(parsed) // "2024-01-01T00:00:00.000Z"
```

## 为什么

编解码器定义了一个 `decode`（解析方向）和 `encode`（序列化方向）对。这对于必须通过不同表示往返的模式至关重要 -
API输入/输出、数据库序列化、表单值到/从领域类型。

|      | `.transform()` | `z.codec()`            |
|------|----------------|------------------------|
| 方向   | 单向（输入 → 输出）    | 双向（解码 + 编码）            |
| 何时使用 | 仅解析（API输入）     | 往返（API输入 ↔ 输出）         |
| 编码   | 不支持            | `schema.encode(value)` |
