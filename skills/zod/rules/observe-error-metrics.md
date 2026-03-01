---
title: 跟踪每个模式和字段的验证错误率
impact: MEDIUM
description: 将safeParse包装在跟踪助手中，该助手在失败时为每个模式和每个字段递增计数器。识别过于严格的模式（高失败率）和过于宽松的模式（从不失败）。
tags: observability, metrics, monitoring, validation, production
---

# 跟踪每个模式和字段的验证错误率

## 问题

如果没有验证失败的指标，你就无法了解模式在生产环境中的行为。过于严格的模式会静默拒绝有效的用户输入（导致UX挫败感），而从不失败的过于宽松的模式可能没有提供任何真正的保护。

## 错误做法

```typescript
// 无监控 - 验证是黑盒
app.post("/api/orders", (req, res) => {
  const result = OrderSchema.safeParse(req.body)
  if (!result.success) {
    return res.status(400).json({ error: "Invalid" })
  }
  // 这多久失败一次？哪些字段？没人知道。
})
```

## 正确做法

```typescript
import { z } from "zod"

// 跟踪的safeParse包装器
function trackedSafeParse<T extends z.ZodType>(
  schema: T,
  data: unknown,
  schemaName: string
): z.SafeParseReturnType<z.input<T>, z.output<T>> {
  const result = schema.safeParse(data)

  metrics.increment("zod.validation.attempt", { schema: schemaName })

  if (!result.success) {
    metrics.increment("zod.validation.failure", { schema: schemaName })

    // 跟踪哪些字段失败
    const flat = z.flattenError(result.error)
    for (const field of Object.keys(flat.fieldErrors)) {
      metrics.increment("zod.validation.field_error", {
        schema: schemaName,
        field,
      })
    }
  }

  return result
}

// 用法
app.post("/api/orders", (req, res) => {
  const result = trackedSafeParse(OrderSchema, req.body, "OrderSchema")
  if (!result.success) {
    return res.status(400).json({
      errors: z.flattenError(result.error).fieldErrors,
    })
  }
  processOrder(result.data)
})
```

## 指标告诉你什么

| 信号 | 含义 | 行动 |
|--------|---------|--------|
| 模式的高失败率 | 模式可能过于严格 | 审查约束，检查用户是否发送了被拒绝的有效数据 |
| 一个字段主导失败 | 令人困惑的输入格式 | 改进表单UX，添加强制转换，澄清文档 |
| 模式从不失败 | 模式可能过于宽松 | 审查它是否实际验证了任何有意义的内容 |
| 部署后失败激增 | 模式更改破坏了客户端 | 回滚或使更改具有加法性 |

## 为什么

验证指标关闭了模式设计与实际使用之间的反馈循环。没有它们，你就是在猜测模式是在帮助还是在伤害。跟踪每个模式和每个字段的失败率将Zod从沉默的门卫转变为可观察的系统组件。
