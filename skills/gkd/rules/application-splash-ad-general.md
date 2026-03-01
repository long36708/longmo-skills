---
title: 开屏广告通用规则
impact: high
description: 适用于大部分应用的开屏广告处理规则
---

# 开屏广告通用规则

## 问题描述

开屏广告是应用启动时最常见的广告形式，需要高效准确的识别和处理方案。

## 通用情况选择器

```text
anyMatches: [
  '[text*="跳过"][text.length<10][width<500 && height<300][visibleToUser=true]',
  '@[name$="View" || name$="LinearLayout"][clickable=true][childCount<2][width<300 && height<200] - [text="互动广告"][visibleToUser=true]',
  '[childCount=0][visibleToUser=true][width<500 && height<300][(text.length<10 && (text*="跳过" || text*="跳 过" || text*="跳過" || text~="(?is).*skip.*") && text!*="视频" && text!*="片头" && text!*="片尾") || (vid~="(?is).*skip.*" && vid!~="(?is).*video.*" && vid!~="(?is).*head.*" && vid!~="(?is).*tail.*" && !(text="帮助") && !(text="取消") && !(text*="退出")) || id$="tt_splash_skip_btn" || (desc.length<10 && (desc*="跳过" || desc*="跳過" || desc~="(?is).*skip.*"))]',
],
```

## 字节开屏广告

右上角是圆形跳过按钮，被一个黄色圆圈包围：

```text
anyMatches: [
  '@View[text=null][clickable=true][childCount=0][visibleToUser=true][width<200&&height<200] +(1,2) TextView[index=parent.childCount.minus(1)][childCount=0] <n FrameLayout[childCount>2][text=null][desc=null] >(n+6) [text*="第三方应用" || text*="扭动手机" || text*="点击或上滑" || text*="省钱好物" || text*="扭一扭"][visibleToUser=true]',
  'FrameLayout > FrameLayout[childCount>2][text=null][desc=null] > @View[text=null][clickable=true][childCount=0][visibleToUser=true][width<200&&height<200] +(1,2) TextView[index=parent.childCount.minus(1)][childCount=0][visibleToUser=true]',
],
```

## 排除匹配规则

防止在搜索页面误触：

```text
([text*="搜索" || text="历史记录" || text$="在搜"][text.length>3 && text.length<7][visibleToUser=true]) || ([text="Submit" || text*="阅读并同意" || text="书签" || text="NEXT"][visibleToUser=true]) || ([text$="设置" || text$="选好了" || text^="下一步" || text^="完成" || text*="跳过片"][text.length<10][visibleToUser=true]) || ([text^="选择"][text*="偏好" || text*="兴趣" || text*="喜好"][text.length<10][visibleToUser=true])
```

## 说明

### 通用规则特点

- **多种匹配模式**：使用 `anyMatches` 数组，提供多种跳过按钮的识别方案
- **文本长度限制**：限制 `text.length<10` 避免误触长文本按钮
- **尺寸限制**：限制按钮尺寸避免误触大型按钮

### 字节广告特殊处理

- **特殊结构识别**：识别右上角圆形跳过按钮的特殊布局
- **关联文本识别**：通过关联的广告文本提高识别准确性

### 排除匹配策略

- **搜索页面排除**：避免在应用搜索页面误触
- **文本长度筛选**：通过文本长度区分首页和搜索页的"搜索"文本
- **常见按钮排除**：排除设置、完成、下一步等常见功能按钮

## 实际应用

这些规则适用于大部分应用的开屏广告处理，覆盖了常见的广告样式和跳过按钮布局。