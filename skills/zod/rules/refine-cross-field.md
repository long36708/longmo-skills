---
title: 跨字段验证
impact: HIGH
description: 在父对象上使用 .superRefine() 进行跨字段验证，并使用路径定位错误。
tags: superRefine, cross-field, password, confirm
---

# 跨字段验证

## 问题

单个字段的精化无法访问同级字段。您需要在父对象级别进行验证，并使用 `path` 将错误定位到特定字段。

## 错误示例

```typescript
// BUG: 单个字段无法访问同级字段
const Form = z.object({
  password: z.string().min(8),
  confirm: z.string().refine(
    (val) => val === ???, // 这里无法访问 password 字段
    { error: "密码不匹配" }
  ),
})
```

## 正确示例

```typescript
const Form = z
  .object({
    password: z.string().min(8),
    confirm: z.string(),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirm) {
      ctx.addIssue({
        code: "custom",
        path: ["confirm"], // 错误定位到 confirm 字段
        message: "密码不匹配",
      })
    }
  })

// 错误出现在 "confirm" 字段上，而不是根对象
```

## 原因

父对象上的 `.superRefine()` 接收完整的解析数据和用于添加问题的上下文。使用 `path` 将错误定位到特定字段——这对于按字段显示错误的表单库至关重要。
