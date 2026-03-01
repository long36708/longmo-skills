---
title: 品牌类型用于名义类型
impact: MEDIUM
description: 使用.brand<"Name">()进行名义类型以防止混合结构相同的类型。
tags: brand, nominal, type-safety, USD, EUR
---

# 品牌类型用于名义类型

## 问题

TypeScript使用结构类型 - 具有相同形状的两个类型是可互换的。这意味着你可能意外地传递USD值到期望EUR的地方，或者传递UserId到期望PostId的地方。

## 错误做法

```typescript
// 错误：没有什么可以防止混淆这些
type USD = number
type EUR = number

function convert(amount: USD, rate: number): EUR {
  return amount * rate
}

const priceInEur: EUR = 100
convert(priceInEur, 1.1) // 无错误！EUR作为USD传递
```

## 正确做法

```typescript
// 正确：品牌类型防止混淆
const USD = z.number().brand<"USD">()
const EUR = z.number().brand<"EUR">()

type USD = z.infer<typeof USD> // number & { __brand: "USD" }
type EUR = z.infer<typeof EUR> // number & { __brand: "EUR" }

function convert(amount: USD, rate: number): EUR {
  return EUR.parse(amount * rate)
}

const priceInEur = EUR.parse(100)
convert(priceInEur, 1.1) // TypeScript错误！EUR不是USD
```

## 为什么

`.brand()` 添加了一个幻象类型品牌，使结构相同的类型在TypeScript级别不兼容。将此用于ID（UserId vs PostId）、货币、单位或任何混合值是逻辑错误的领域。
