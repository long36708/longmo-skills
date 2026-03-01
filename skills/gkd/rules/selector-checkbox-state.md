---
title: 处理复选框状态
impact: high
description: 正确处理复选框的勾选状态，避免误操作
---

# 处理复选框状态

## 问题描述

对于可勾选的复选框节点（`[checkable=true]`），需要正确处理其勾选状态（`checked` 属性），避免错误的点击操作。

## 错误示例

```text
@CheckBox[clickable=true] + [text$="不再询问"]
```

## 正确示例

### 打勾操作（未勾选 → 已勾选）

```text
@CheckBox[clickable=true][checked=false] + [text$="不再询问"]
```

### 取消勾选操作（已勾选 → 未勾选）

```text
@CheckBox[clickable=true][checked=true] + [text$="不再询问"]
```

## 说明

- **使用 `checked` 属性**：通过 `[checked=false]` 或 `[checked=true]` 来精确控制复选框状态。
- **验证兼容性**：不是所有复选框都能通过 `checked` 属性判断是否勾选，使用前务必抓取勾选前和勾选后的快照进行对比。
- **明确操作意图**：根据实际需求选择正确的状态条件。

## 实际应用

快照示例：
- 未勾选状态：https://i.gkd.li/i/25098582
- 已勾选状态：https://i.gkd.li/i/25098563