---
title: reportInput 泄漏敏感数据
impact: HIGH
description: 永远不要在生产环境中启用 reportInput。它会在错误消息中嵌入原始输入值。
tags: security, reportInput, logging, production
---

# reportInput 泄漏敏感数据

## 问题

Zod v4的 `reportInput` 选项在错误问题中包含原始输入值。如果在生产环境中启用，敏感数据（密码、令牌、PII）最终会出现在错误日志、监控系统和API响应中。

## 错误做法

```typescript
// BUG: 将密码、令牌、PII泄漏到错误消息中
app.post("/register", (req, res) => {
  const result = UserSchema.safeParse(req.body, { reportInput: true })
  if (!result.success) {
    // error.issues[0].input 可能包含："myP@ssw0rd123"
    logger.error(result.error.issues)
    res.status(400).json({ errors: result.error.issues })
  }
})
```

## 正确做法

```typescript
// 正确：仅在开发/调试中使用 reportInput
const parseOptions = {
  reportInput: process.env.NODE_ENV === "development",
}

app.post("/register", (req, res) => {
  const result = UserSchema.safeParse(req.body, parseOptions)
  if (!result.success) {
    // 在生产环境中，问题不会包含原始输入值
    const flat = z.flattenError(result.error)
    res.status(400).json({ errors: flat.fieldErrors })
  }
})
```

## 为什么

错误问题通常会被记录、发送到错误监控系统（Sentry、Datadog），有时还会在API响应中返回。在这些流程中包含原始输入值违反了数据隐私原则，并可能暴露敏感用户数据。
