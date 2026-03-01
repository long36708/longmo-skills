---
title: 递归模式设计
impact: CRITICAL
description: 对递归模式使用 getter 模式。永远不要传递循环数据。
tags: recursive, lazy, getter, tree
---

# 递归模式设计

## 问题

递归模式（树结构、嵌套评论、分类）需要特殊处理。直接自引用不起作用，因为变量尚未定义。Zod v4 使用 getter 模式替代 `z.lazy()`。

## 错误示例

```typescript
// BUG: z.lazy() 在 Zod v4 中已移除
const Category = z.object({
  name: z.string(),
  children: z.lazy(() => z.array(Category)),
})

// BUG: 直接引用 — Category 尚未定义
const Category = z.object({
  name: z.string(),
  children: z.array(Category), // ReferenceError
})
```

## 正确示例

```typescript
// 正确: Zod v4 中递归模式的 getter 模式
const Category = z.object({
  name: z.string(),
  get children() {
    return z.array(Category).optional()
  },
})

type Category = z.infer<typeof Category>
// { name: string; children?: Category[] | undefined }
```

## 原因

Getter 模式将属性访问延迟到解析时，避免了暂时性死区。这是 Zod v4 对 `z.lazy()` 的替代方案。永远不要将循环数据（引用自身的对象）传递给递归模式——这将导致无限循环且没有错误提示。
