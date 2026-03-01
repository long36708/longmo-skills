---
title: 显式处理未知键
impact: CRITICAL
description: 默认的 z.object() 会剥离未知键。使用 strictObject 或 looseObject 以获得明确的行为。
tags: object, unknown-keys, strict, passthrough
---

# 显式处理未知键

## 问题

`z.object()` 会静默剥离模式中未定义的任何键。这在转发负载、存储额外元数据或代理 API 响应时可能导致数据丢失。

## 错误示例

```typescript
const Config = z.object({
  host: z.string(),
  port: z.number(),
})

// BUG: 未知键被静默丢弃
const input = { host: "localhost", port: 3000, debug: true, logLevel: "verbose" }
const result = Config.parse(input)
// result = { host: "localhost", port: 3000 } — debug 和 logLevel 消失了
```

## 正确示例

```typescript
// 拒绝未知键（API 输入验证）
const StrictConfig = z.strictObject({
  host: z.string(),
  port: z.number(),
})
// 对 { host: "localhost", port: 3000, debug: true } 抛出错误

// 保留未知键（代理、转发）
const LooseConfig = z.looseObject({
  host: z.string(),
  port: z.number(),
})
// 传递 { host: "localhost", port: 3000, debug: true, logLevel: "verbose" }

// 剥离未知键（默认 — 当您明确想要剥离时）
const SafeConfig = z.object({
  host: z.string(),
  port: z.number(),
})
```

## 原因

| 变体 | 未知键处理 | 使用场景 |
|------|-----------|---------|
| `z.object()` | 剥离 | 清理用户输入，只需要已知字段 |
| `z.strictObject()` | 拒绝（错误） | API 合约，配置验证 — 避免意外情况 |
| `z.looseObject()` | 保留 | 代理数据，转发负载，中间件 |
