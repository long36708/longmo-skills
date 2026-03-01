---
title: 使用 JSON5 格式编写订阅规则
impact: MEDIUM
description: GKD 订阅规则使用 JSON5 格式，支持无引号键名、注释等便利特性，比标准 JSON 更易维护。
tags: subscription, json5, format, comments, maintenance
---

# 使用 JSON5 格式编写订阅规则

## 问题

使用标准 JSON 格式编写规则时，缺乏注释支持和严格的语法要求，导致规则难以维护和理解。

## 错误示例

```json
// BUG: 标准 JSON 不支持注释，且需要严格语法
{
  "id": "com.example.app",
  "name": "示例应用",
  "groups": [
    {
      "key": 0,
      "name": "开屏广告",
      "rules": {
        "matches": "TextView[id=\"btn_skip\"]"
      }
    }
  ]
}
```

## 正确示例

```json5
// 正确：使用 JSON5 格式，支持注释和无引号键名
{
  // 应用基本信息
  id: 'com.example.app',
  name: '示例应用',
  version: 0,
  author: '开发者',
  
  // 规则组定义
  groups: [
    {
      key: 0,
      name: '开屏广告',
      rules: {
        matches: 'TextView[id="btn_skip"]'
      },
      snapshotUrls: ['https://i.gkd.li/i/12345678'],
    },
  ],
}
```

## JSON5 特性

### 无引号键名

```json5
// JSON5 允许无引号键名
{
  id: 'com.example.app',
  name: '示例应用',
  version: 0,
}
```

### 注释支持

```json5
{
  // 单行注释
  id: 'com.example.app',
  
  /*
   * 多行注释
   * 用于详细说明规则用途
   */
  name: '示例应用',
}
```

### 尾随逗号

```json5
{
  groups: [
    {
      key: 0,
      name: '规则组1',
    },
    {
      key: 1,
      name: '规则组2',
    },  // 允许尾随逗号
  ],
}
```

## 规则结构最佳实践

### 基本结构

```json5
{
  // 必需字段
  id: 'com.example.app',
  name: '应用名称',
  version: 0,
  
  // 可选字段
  author: '开发者',
  updateUrl: 'https://example.com/gkd.json5',
  
  // 规则组
  groups: [
    // 规则组1
    {
      key: 0,
      name: '规则组名称',
      rules: { matches: '选择器' },
      snapshotUrls: ['快照链接'],
    },
  ],
}
```

### 添加详细注释

```json5
{
  // 应用标识符，必须与包名一致
  id: 'com.zhihu.android',
  
  // 应用显示名称
  name: '知乎',
  
  // 规则版本，更新时递增
  version: 1,
  
  groups: [
    {
      // 规则组唯一标识
      key: 0,
      
      // 规则组描述
      name: '开屏广告',
      
      // 规则配置
      rules: {
        // 选择器：定位跳过按钮
        matches: 'TextView[id="com.zhihu.android:id/btn_skip"]'
      },
      
      // 快照链接，用于验证规则
      snapshotUrls: ['https://i.gkd.li/i/13070251'],
    },
  ],
}
```

## 验证工具

使用 GKD 的网页审查工具验证 JSON5 格式：
1. 打开快照审查工具
2. 在规则编辑器中测试 JSON5 语法
3. 确保规则能正确解析和执行

## 原因

使用 JSON5 格式可以：
1. **提高可读性**: 支持注释，便于团队协作
2. **简化维护**: 无引号键名和尾随逗号减少语法错误
3. **增强可维护性**: 清晰的注释说明规则用途和逻辑