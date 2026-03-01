---
title: "v4: 顶级字符串格式"
impact: MEDIUM
description: 使用顶级的z.email()、z.uuid()、z.url()而不是已弃用的z.string().email()。
tags: migration, v4, string, email, uuid, url
---

# v4: 顶级字符串格式

## 问题

Zod v4将字符串格式验证器提升为顶级函数。旧的 `z.string().email()` 链式风格已弃用。

## 错误做法

```typescript
// 错误：已弃用的v3风格 - 链式字符串方法
const Email = z.string().email()
const Url = z.string().url()
const Uuid = z.string().uuid()
const Cuid = z.string().cuid()
```

## 正确做法

```typescript
// 正确：v4顶级格式函数
const Email = z.email()
const Url = z.url()
const Uuid = z.uuid()
const Cuid = z.cuid()
const Cuid2 = z.cuid2()
const Ulid = z.ulid()
const Emoji = z.emoji()
const Ipv4 = z.ipv4()
const Ipv6 = z.ipv6()
const Cidrv4 = z.cidrv4()
const Cidrv6 = z.cidrv6()
const Jwt = z.jwt()
const Base64 = z.base64()
const Base64url = z.base64url()
```

## 为什么

顶级格式函数返回具有优化验证的专用模式类型。它们也更好地组合 - `z.email()` 比 `z.string().email()` 更短更清晰。旧的链式语法在v4中已弃用。
