---
title: 卡片广告选择器
impact: high
description: 卡片式广告的定位和点击规则
---

# 卡片广告选择器

## 问题描述

卡片广告是应用内常见的嵌入式广告形式，需要特殊的定位和点击策略。

## 选择器-1（可快速查询）

```text
@ImageView[childCount=0][visibleToUser=true] < FrameLayout[childCount=1] - LinearLayout[childCount=2] > [text="下载应用" || text="立即下载" || text="查看详情" || text="领取优惠" || text="进入小程序" || text="了解更多"][visibleToUser=true]
```

## 选择器-2（可快速查询）

```text
@View[clickable=true][childCount=0][visibleToUser=true] < FrameLayout[desc^="dislike"] + FrameLayout >2 [text="广告"]
```

## 说明

### 卡片广告结构特点

- **图标+文本布局**：通常包含一个图标和相关的操作文本
- **多层嵌套结构**：采用 FrameLayout 和 LinearLayout 的多层嵌套
- **固定文本模式**：使用常见的广告引导文本，如"下载应用"、"立即下载"等

### 选择器设计思路

1. **图标定位**：通过 `@ImageView[childCount=0]` 定位广告图标
2. **容器关联**：识别包含广告内容的容器结构
3. **文本验证**：通过广告文本验证广告类型
4. **点击目标**：选择可点击的关闭按钮或操作区域

### 选择器-1 特点

- **图标识别**：通过空 ImageView 识别广告图标
- **布局关联**：识别图标与操作文本的关联布局
- **文本匹配**：匹配常见的卡片广告操作文本

### 选择器-2 特点

- **dislike 标识**：通过 `desc^="dislike"` 识别广告反馈按钮
- **广告文本验证**：通过 `[text="广告"]` 验证广告类型
- **可点击目标**：直接点击可点击的关闭按钮

## 实际应用

这些选择器适用于以下场景：
- 应用内嵌的卡片式广告
- 信息流中的推广内容
- 侧边栏的推荐广告

使用时应根据具体广告样式选择合适的规则，注意不同平台广告的细微差异。