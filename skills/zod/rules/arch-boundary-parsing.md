---
title: 在系统边界解析，而不是在领域逻辑中
impact: CRITICAL
description: 在入口点（API处理器、环境启动、表单解析器、外部获取）调用 safeParse() 并将类型化数据向内传递。领域逻辑接收类型化值，而不是 unknown。
tags: architecture, boundaries, parsing, safeParse, separation-of-concerns
---

# 在系统边界解析，而不是在领域逻辑中

## 问题

当 `safeParse()` 调用散布在领域逻辑中时，每个函数都必须处理 `unknown` 输入和验证错误。这将解析关注点与业务逻辑混合在一起，导致错误处理不一致，并创建冗余验证。

## 错误做法

```typescript
// BUG: 领域逻辑处理未知输入和解析
function calculateDiscount(data: unknown) {
  const result = OrderSchema.safeParse(data)
  if (!result.success) {
    throw new Error("Invalid order")
  }
  const order = result.data
  if (order.total > 100) {
    return order.total * 0.1
  }
  return 0
}

// BUG: 服务层重新解析已经验证过的数据
function processOrder(data: unknown) {
  const result = OrderSchema.safeParse(data)
  if (!result.success) return { error: "Invalid" }
  const discount = calculateDiscount(data) // 再次解析！
  return { total: result.data.total - discount }
}
```

## 正确做法

```typescript
// 在边界解析一次
app.post("/orders", (req, res) => {
  const result = OrderSchema.safeParse(req.body)
  if (!result.success) {
    return res.status(400).json({
      errors: z.flattenError(result.error).fieldErrors,
    })
  }
  // 传递类型化数据向内 - 不再有 unknown
  const response = processOrder(result.data)
  res.json(response)
})

// 领域逻辑接收类型化数据 - 不需要解析
function calculateDiscount(order: Order): number {
  return order.total > 100 ? order.total * 0.1 : 0
}

function processOrder(order: Order) {
  const discount = calculateDiscount(order)
  return { total: order.total - discount }
}

type Order = z.infer<typeof OrderSchema>
```

## 决策表：在哪里解析

| 边界 | 在哪里调用 safeParse() |
|----------|--------------------------|
| Express/Fastify 路由 | 在路由处理器中，调用服务函数之前 |
| tRPC | `.input(Schema)` - 框架为你解析 |
| Next.js 服务器动作 | 在动作函数顶部，任何逻辑之前 |
| React Hook Form | `zodResolver(Schema)` - 解析器在提交时解析 |
| 环境变量 | 在应用启动时（例如 `envSchema.parse(process.env)`） |
| 外部 API 响应 | 在 `fetch()` 之后立即，使用数据之前 |
| 数据库结果 | 查询之后，如果模式可能与数据库形状不同步 |
| 消息队列消费者 | 在处理器顶部，处理之前 |

## 为什么

在边界解析意味着领域函数是纯粹的——它们接受类型化值并返回类型化值。这消除了冗余验证，集中了错误处理，并使业务逻辑更容易测试（无需构造无效输入）。边界层是唯一处理 `unknown` 数据的地方。
