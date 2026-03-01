---
title: 客户端包使用Zod Mini
impact: MEDIUM
description: 对于包大小关键的客户端应用使用Zod Mini（1.88kb）。函数式API而不是方法。
tags: bundle-size, mini, client, tree-shaking
---

# 客户端包使用Zod Mini

## 问题

完整的Zod显著增加了客户端包的体积。对于包大小很重要的表单验证或客户端解析，Zod Mini以约1.88kb的gzip大小提供相同的核心功能。

## 错误做法

```typescript
// 错误：在包大小很重要的客户端包中使用完整Zod
import { z } from "zod"

const LoginForm = z.object({
  email: z.email(),
  password: z.string().min(8),
})
```

## 正确做法

```typescript
// 正确：客户端包使用Zod Mini - 1.88kb gzip
import { z } from "zod/v4/mini"

const LoginForm = z.object({
  email: z.email(),
  password: z.string().check(z.minLength(8)),
})
```

## 为什么

Zod Mini使用函数式API（带有检查函数的`.check()`）而不是可链接的方法API。这实现了更好的tree-shaking。在包大小不重要的服务器上使用完整Zod，在包大小重要的客户端上使用Zod Mini。

| | 完整Zod | Zod Mini |
|---|---|---|
| 大小（gzip） | ~13kb | ~1.88kb |
| API风格 | 方法链（`.min()`、`.max()`） | 函数式（`.check(z.minLength())`） |
| 特性 | 全部 | 核心（无`.describe()`，无JSON Schema） |
| 何时使用 | 服务器、Node.js、脚本 | 客户端包、边缘函数 |
