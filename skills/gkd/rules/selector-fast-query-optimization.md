---
title: 利用快速查询优化选择器性能
impact: HIGH
description: 在支持快速查询的节点上使用特定的选择器格式，可以显著提高匹配性能。
tags: selector, performance, optimization, fast-query, android-api
---

# 利用快速查询优化选择器性能

## 问题

复杂的选择器可能导致性能问题，特别是在节点数量多的界面上。没有利用 Android 提供的快速查询 API 会导致不必要的遍历。

## 错误示例

```text
// BUG: 没有利用快速查询，性能较差
[childCount=2] > [id="target_id"]

// BUG: 属性顺序错误，无法触发快速查询
[visibleToUser=true][id="target_id"]
```

## 正确示例

```text
// 正确：利用 id 进行快速查询
[id="target_id"][childCount=2]

// 正确：利用 vid 进行快速查询
[vid="unique_view"]

// 正确：利用 text 进行快速查询
[text^="跳过"]
```

## 快速查询条件

### 支持的属性格式

选择器的**末尾属性选择器**的第一个属性选择表达式必须是以下格式之一：

- `[id='abc']`
- `[vid='abc']` 
- `[text='abc']`
- `[text^='abc']`
- `[text*='abc']`
- `[text$='abc']`

或者使用 `||` 连接这些格式的逻辑表达式：

```text
[id='abc' || vid='abc' || text='abc']
```

### 局部快速查询

在关系选择器中使用 `<<n` 时，也可以触发局部快速查询：

```text
// 局部快速查询示例
ContainerView > [vid="target"] <<n RootView
```

## 错误与正确对比

| 错误写法 | 正确写法 | 原因 |
|----------|----------|------|
| `[childCount=2][id="x"]` | `[id="x"][childCount=2]` | 属性顺序影响快速查询触发 |
| `A > B + C[childCount=2][id="x"]` | `A > B + C[id="x"][childCount=2]` | 末尾选择器的第一个属性必须是快速查询属性 |
| `[id="x"] <<n D` | `[id="x"] <<n D` | 局部快速查询需要 `<<n` 关系 |

## 性能优化示例

### 复杂界面优化

```text
// 优化前：性能较差
RecyclerView > LinearLayout > TextView[text="确认"]

// 优化后：利用快速查询
@TextView[text="确认"] <<n RecyclerView
```

### 多层嵌套优化

```text
// 多层快速查询优化
[vid="image"] <<n [vid="recyclerView"] <<n [vid="content_layout"]
```

## 启用快速查询

需要在规则中设置 `fastQuery: true`：

```json5
{
  fastQuery: true,
  matches: '[vid="target_view"][clickable=true]',
}
```

## 原因

快速查询优化可以：
1. **显著提升性能**: 避免全量节点遍历
2. **利用 Android API**: 直接调用系统级优化查询
3. **减少资源消耗**: 在复杂界面中特别有效