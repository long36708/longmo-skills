---
title: 将模式与其边界层共置
impact: HIGH
description: 将模式放置在使用的边界旁边。API模式放在api/users/schemas.ts，表单模式放在features/profile/form-schema.ts。领域类型使用z.infer，永远不要跨层重新导出原始模式。
tags: architecture, organization, co-location, project-structure
---

# 将模式与其边界层共置

## 问题

将所有模式转储到单个 `schemas/` 文件夹中会创建一堆无关模式的杂物袋，没有指示它们在哪里使用。API路由、表单验证和环境解析的模式都混合在一起，不清楚哪个边界拥有哪个模式。

## 错误做法

```
// BUG: 所有内容都在一个文件夹中 - 没有分层，所有权不明确
src/
  schemas/
    user.ts          // 被API、表单和环境使用？
    order.ts
    config.ts
    form-profile.ts
    api-response.ts
    db-result.ts
```

```typescript
// BUG: 领域模块导入并重新导出原始模式
// src/domain/user.ts
import { UserSchema } from "../schemas/user"
export { UserSchema } // 将解析泄漏到领域
```

## 正确做法

```
src/
  api/
    users/
      route.ts
      schemas.ts       // /users的API请求/响应模式
    orders/
      route.ts
      schemas.ts       // /orders的API模式
  features/
    profile/
      form-schema.ts   // 表单验证模式
      ProfileForm.tsx
  config/
    env.ts             // 环境变量模式，在启动时解析
  domain/
    types.ts           // 仅z.infer类型 - 没有原始模式
```

```typescript
// api/users/schemas.ts - 与路由共置
import { z } from "zod"

export const CreateUserBody = z.object({
  name: z.string().min(1),
  email: z.email(),
})

export const UserResponse = z.object({
  id: z.string(),
  name: z.string(),
  email: z.email(),
})

// domain/types.ts - 仅推断类型，没有原始模式
import type { CreateUserBody, UserResponse } from "../api/users/schemas"
import type { z } from "zod"

export type CreateUser = z.infer<typeof CreateUserBody>
export type User = z.infer<typeof UserResponse>
```

## 为什么

共置使所有权清晰：API路由处理器及其模式位于同一目录中。当路由更改时，模式随之更改。领域类型通过 `z.infer` 派生，因此领域层从不直接依赖Zod - 仅依赖TypeScript类型。这将解析保持在边界，业务逻辑不受验证关注点的影响。
