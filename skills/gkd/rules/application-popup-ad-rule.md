---
title: 弹窗广告处理规则
impact: high
description: 各类弹窗广告的通用处理方案
---

# 弹窗广告处理规则

## 问题描述

弹窗广告是应用内常见的干扰形式，需要针对不同类型提供准确的处理方案。

## 腾讯广告处理

### 选择器-1（可快速查询）

```text
@ImageView[childCount=0][text=null][desc=null][id=null][visibleToUser=true][width<90 && height<90] < FrameLayout[childCount=1][text=null][desc=null][id=null][parent.childCount>3] <n FrameLayout >(2,3) [text^="立即" || text$="详情" || text^="了解" || text="去微信看看" || text$="应用" || text="进入小程序" || text="领取优惠" || text="跳转微信"]
```

### 选择器-2（可快速查询）

```text
@ImageView[childCount=0][text=null][desc=null][id=null][visibleToUser=true][width<90 && height<90] < FrameLayout[childCount=1][text=null][desc=null][id=null] <2 FrameLayout[childCount=5] + FrameLayout[childCount=2] > [text^="立即" || text$="详情" || text^="了解" || text="去逛逛" || text="去微信看看" || text$="应用" || text="进入小程序" || text="领取优惠" || text="跳转微信"]
```

## 京东广告处理

### 选择器-1（可快速查询）

```text
@ImageView[childCount=0][text=null][visibleToUser=true] < FrameLayout[childCount=1] <2 FrameLayout[childCount=2] <2 FrameLayout[childCount=2] <2 FrameLayout[childCount=2] - FrameLayout > [text^="扭动或点击"]
```

## 快手广告处理

### 关闭按钮在左上角，广告字样在左下角（可快速查询）

```text
@ViewGroup[childCount=1][clickable=true][visibleToUser=true] < ViewGroup +n ViewGroup[childCount=2] > [text="广告"]
```

### 倒计时和关闭按钮用竖线隔开（可快速查询）

```text
matches: [
  '[text="广告"]',
  '@ImageView[clickable=true] - [text="|"] - [text$="s"]',
],
```

## 字节广告处理

### 选择器-1（有反馈字样，不可快速查询）

```text
@Image[childCount=0][text=""][width<60 && height<60] < View[childCount=1] + View +n View > View[childCount=1] > TextView[text$="广告"]
```

## 说明

### 腾讯广告特点

- **小图标识别**：通过小尺寸的关闭图标定位
- **关联文本识别**：通过关联的广告文本提高准确性
- **多层结构定位**：识别弹窗广告的多层嵌套结构

### 京东广告特点

- **扭动提示识别**：识别底部的"扭动或点击"提示文本
- **深层嵌套结构**：处理多层嵌套的布局结构

### 快手广告特点

- **位置固定**：关闭按钮在左上角，广告字样在左下角
- **倒计时格式**：识别倒计时和关闭按钮的特殊分隔格式

### 字节广告特点

- **反馈标识**：通过"反馈"字样识别
- **小图标定位**：通过小尺寸的反馈图标定位

## 实际应用

这些规则覆盖了主流平台的弹窗广告样式，提供了针对性的处理方案。使用时应根据具体广告样式选择合适的规则。