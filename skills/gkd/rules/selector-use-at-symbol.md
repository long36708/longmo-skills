---
title: 使用 `@` 符号标记目标节点
impact: HIGH
description: 在 GKD 选择器中，使用 `@` 符号明确标记需要点击的目标节点，避免误操作。
tags: selector, target, at-symbol, click-target, precision
---

# 使用 `@` 符号标记目标节点

## 问题

在复杂的界面结构中，如果没有明确标记目标节点，GKD 可能会选择错误的节点进行点击，导致意外的操作结果。

## 错误示例

```text
// BUG: 没有明确标记目标节点，可能选择到错误的节点
LinearLayout > TextView[id="btn_skip"]

// 或者使用复杂的表达式来定位
TextView < LinearLayout < FrameLayout
```

## 正确示例

```text
// 明确标记目标节点为 LinearLayout
@LinearLayout > TextView[id="btn_skip"]

// 明确标记目标节点为 TextView
LinearLayout > @TextView[id="btn_skip"]

// 在复杂结构中明确标记
FrameLayout > @LinearLayout > TextView[id="btn_skip"]
```

## 规则详情

- **位置**: `@` 符号必须放在属性选择器的最前面
- **作用**: 标记该节点为最终的目标操作节点
- **默认行为**: 如果没有 `@` 符号，默认选择最后一个属性选择器对应的节点

## 原因

明确的 `@` 符号标记可以：
1. **提高准确性**: 避免在复杂界面中选择错误的节点
2. **增强可读性**: 让规则维护者清楚地知道目标节点
3. **减少错误**: 防止因为界面结构变化导致的误操作

## 实际应用

```text
// 跳过按钮 - 目标是包含跳过文本的父布局
@LinearLayout > TextView[text*="跳过"]

// 关闭按钮 - 目标是图片按钮本身
@ImageView[id="close_btn"]

// 在列表项中点击特定元素
RecyclerView > @LinearLayout[clickable=true] > TextView[text="确认"]
```