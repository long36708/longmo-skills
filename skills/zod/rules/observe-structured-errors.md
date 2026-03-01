---
title: 记录结构化错误，而不是原始ZodError
impact: HIGH
description: 使用z.flattenError()进行紧凑、结构化的日志记录，包含请求关联ID。永远不要console.log原始ZodError - 它嘈杂、非结构化且无法查询。
tags: observability, logging, errors, flattenError, structured-logging
---

# 记录结构化错误，而不是原始ZodError

## 问题

原始 `ZodError` 对象包含深度嵌套的问题数组和内部元数据。直接记录它们会产生嘈杂、非结构化的输出，无法在日志聚合工具（Datadog、Grafana、ELK）中过滤、警报或查询。

## 错误做法

```typescript
// BUG: 原始ZodError嘈杂且无法查询
app.post("/api/users", (req, res) => {
  const result = UserSchema.safeParse(req.body)
  if (!result.success) {
    logger.error("Validation failed", { error: result.error })
    // 记录一个巨大的嵌套对象，包含内部Zod元数据
    // 无法按字段名、模式或请求搜索
    return res.status(400).json({ error: "Invalid input" })
  }
})
```

```typescript
// BUG: console.log - 无结构，无关联
if (!result.success) {
  console.log("Validation failed:", result.error)
}
```

## 正确做法

```typescript
app.post("/api/users", (req, res) => {
  const result = UserSchema.safeParse(req.body)
  if (!result.success) {
    const flat = z.flattenError(result.error)
    logger.warn("validation_failed", {
      requestId: req.id,
      schema: "UserSchema",
      path: req.path,
      formErrors: flat.formErrors,
      fieldErrors: flat.fieldErrors,
    })
    return res.status(400).json({ errors: flat.fieldErrors })
  }
})
```

```typescript
// 可重用的助手，用于一致的结构化日志记录
function logValidationError(
  logger: Logger,
  opts: {
    requestId: string
    schema: string
    error: z.ZodError
    path?: string
  }
) {
  const flat = z.flattenError(opts.error)
  logger.warn("validation_failed", {
    requestId: opts.requestId,
    schema: opts.schema,
    path: opts.path,
    formErrors: flat.formErrors,
    fieldErrors: flat.fieldErrors,
    fieldCount: Object.keys(flat.fieldErrors).length,
  })
}
```

## 为什么

使用 `z.flattenError()` 的结构化日志是紧凑的（字段名 → 错误消息）、可查询的（按模式名或失败字段搜索）和可关联的（请求ID将错误与特定请求关联）。这使仪表板能够显示哪些模式和字段最常失败，对验证峰值率发出警报，并调试特定用户请求。
