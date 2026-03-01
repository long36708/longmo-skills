---
name: gkd
description: >
  GKD 基于无障碍、高级选择器和订阅规则的自定义屏幕点击 Android 应用。
  提供快捷操作、跳过流程等自动化功能，支持复杂的选择器语法和订阅规则配置。
  触发条件：GKD、无障碍点击、选择器、订阅规则、屏幕自动化、Android 自动化。
license: MIT
user-invocable: false
agentic: false
compatibility: "Android 应用开发、自动化脚本编写、无障碍服务开发"
metadata:
  author: Longmo
  version: 1.0.0
  tags: gkd, android, accessibility, automation, selector, subscription, rules
---

# GKD (屏幕自动化工具)

GKD 是一款基于无障碍、高级选择器、订阅规则的自定义屏幕点击 Android 应用。通过自定义规则，在指定界面满足特定条件时，自动点击特定的节点或位置，实现快捷操作和跳过流程等功能。

## 核心概念

### 什么是 GKD

- **无障碍自动化**: 基于 Android 无障碍服务实现屏幕操作
- **高级选择器**: 类似 CSS 选择器的语法，支持复杂节点定位
- **订阅规则**: JSON5 格式的规则配置，支持本地和远程订阅
- **快照审查**: 网页工具辅助调试和验证选择器

### 主要功能

- **快捷操作**: 简化重复流程，如自动确认电脑登录
- **跳过流程**: 自动点击启动时的烦人流程
- **自定义规则**: 灵活配置各种自动化场景

## 按优先级分类的规则类别

| 优先级 | 类别 | 影响程度 | 前缀 | 规则数 |
|----------|----------|--------|--------|-------|
| 1 | 选择器语法 | 关键 | `selector-` | 6 |
| 2 | 性能优化 | 高 | `optimization-` | 2 |
| 3 | 订阅规则 | 高 | `subscription-` | 2 |
| 4 | 实际应用 | 高 | `application-` | 3 |
| 5 | 隐私保护 | 中等 | `privacy-` | 1 |

## 所有 14 条规则

### 选择器语法 (关键)

| 规则 | 文件 | 摘要 |
|------|------|---------|
| 使用 `@` 符号标记目标节点 | `selector-use-at-symbol.md` | 明确标记需要点击的目标节点，避免误操作 |
| 理解选择器从右到左的匹配顺序 | `selector-match-order-right-to-left.md` | 选择器采用从右到左匹配，与直觉相反 |
| 正确处理嵌套转义字符 | `selector-escape-characters.md` | 考虑 GKD、JSON 和正则表达式的多层转义 |
| 理解选择器操作符优先级 | `selector-operator-precedence.md` | `&&` 优先级高于 `||`，需要正确分组 |
| 优先选择可点击节点 | `selector-preferred-clickable-node.md` | 优先选择 `clickable=true` 的节点，提高点击成功率 |
| 处理复选框状态 | `selector-checkbox-state.md` | 正确处理复选框的勾选状态，避免误操作 |

### 性能优化 (高)

| 规则 | 文件 | 摘要 |
|------|------|---------|
| 利用快速查询优化选择器性能 | `selector-fast-query-optimization.md` | 使用特定格式触发 Android API 的快速查询 |
| 全局与局部快速查询 | `selector-fast-query-global-local.md` | 理解全局快速查询和局部快速查询的区别和应用 |

### 订阅规则 (高)

| 规则 | 文件 | 摘要 |
|------|------|---------|
| 使用 JSON5 格式编写订阅规则 | `subscription-json5-format.md` | 支持无引号键名、注释等便利特性 |
| 正确使用 key 值规范 | `subscription-key-usage.md` | 规则组 key 值的唯一标识和递增规范 |

### 实际应用 (高)

| 规则 | 文件 | 摘要 |
|------|------|---------|
| 开屏广告通用规则 | `application-splash-ad-general.md` | 适用于大部分应用的开屏广告处理规则 |
| 弹窗广告处理规则 | `application-popup-ad-rule.md` | 各类弹窗广告的通用处理方案 |
| 卡片广告选择器 | `application-card-ad-selector.md` | 卡片式广告的定位和点击规则 |

### 隐私保护 (中等)

| 规则 | 文件 | 摘要 |
|------|------|---------|
| 保护快照中的隐私信息 | `snapshot-privacy-protection.md` | 处理截图和节点信息中的敏感数据 |

## 核心技能

### 选择器语法

| 技能 | 描述 | 参考文件 |
|------|------|----------|
| 选择器基础语法 | 类似 CSS 选择器的语法结构 | [selector](references/selector.md) |
| 属性选择器 | 节点属性匹配和逻辑表达式 | [selector-attr](references/selector.md#attr) |
| 关系选择器 | 节点间关系定位（父子、兄弟等） | [selector-connect](references/selector.md#connect) |
| 选择器示例 | 实际应用场景的选择器写法 | [example](references/example.md) |

### 节点属性方法

| 技能 | 描述 | 参考文件 |
|------|------|----------|
| 节点属性 | Android 节点可用的属性列表 | [node-attributes](references/node.md) |
| 类型方法 | null、boolean、int、string 类型的方法 | [type-methods](references/node.md) |
| 上下文方法 | context 和 global 类型的特殊方法 | [context-methods](references/node.md) |

### 订阅规则

| 技能 | 描述 | 参考文件 |
|------|------|----------|
| 订阅规则格式 | JSON5 格式的规则配置 | [subscription](references/subscription.md) |
| 应用规则 | 针对特定应用的自动化规则 | [app-rules](references/subscription.md#app-rule) |
| 全局规则 | 跨应用的通用规则配置 | [global-rules](references/subscription.md#global-rule) |

### 优化技巧

| 技能 | 描述 | 参考文件 |
|------|------|----------|
| 查询优化 | 选择器性能优化技巧 | [optimize](references/optimize.md) |
| 快速查询 | 利用 Android API 加速节点查找 | [fast-query](references/optimize.md#fast-query) |
| 主动查询 | 从根节点开始的查询优化 | [enforce-query](references/optimize.md#enforce) |

### 快照工具

| 技能 | 描述 | 参考文件 |
|------|------|----------|
| 快照审查 | 网页工具调试和验证选择器 | [snapshot](references/snapshot.md) |
| 快照抓取 | 多种方式获取界面快照 | [capture-snapshot](references/snapshot.md#capture-snapshot) |
| 快照分享 | 上传和分享快照文件 | [upload-snapshot](references/snapshot.md#how-to-upload) |

### 实际应用场景

| 技能 | 描述 | 参考文件 |
|------|------|----------|
| 通用选择器 | 各种广告场景的通用规则 | [Selectors](references/Selectors.md) |
| 复选框状态 | 处理复选框的勾选状态 | [checkbox-state](references/checkbox-state.md) |
| 快速查询优化 | 全局和局部快速查询技巧 | [fast-query](references/fast-query.md) |
| Key 值规范 | 规则组 key 值的正确使用 | [key-usage](references/key-usage.md) |
| 优先点击可点击节点 | 提高点击成功率的技巧 | [preferred-clickable-node](references/preferred-clickable-node.md) |

## 快速参考

### 选择器基础语法

```text
@LinearLayout > TextView[id=`com.byted.pangle:id/tt_item_tv`][text=`不感兴趣`]
```

### 订阅规则模板

```json5
{
  id: 'com.zhihu.android',
  name: '知乎',
  groups: [
    {
      key: 0,
      name: '开屏广告',
      rules: { matches: 'TextView[id="com.zhihu.android:id/btn_skip"]' },
      snapshotUrls: ['https://i.gkd.li/i/13070251'],
    },
  ],
}
```

### 属性操作符

| 操作符 | 名称 | 说明 |
|--------|------|------|
| `=` | 等于 | 完全匹配 |
| `^=` | 以...开头 | 字符串前缀匹配 |
| `*=` | 包含... | 字符串包含匹配 |
| `$=` | 以...结尾 | 字符串后缀匹配 |
| `~=` | 正则匹配 | 正则表达式匹配 |

### 关系操作符

| 操作符 | 名称 | 说明 |
|--------|------|------|
| `+` | 前置兄弟节点 | 左侧节点是右侧节点的前一个兄弟 |
| `-` | 后置兄弟节点 | 左侧节点是右侧节点的后一个兄弟 |
| `>` | 祖先节点 | 左侧节点是右侧节点的祖先 |
| `<` | 直接子节点 | 左侧节点是右侧节点的直接子节点 |
| `<<` | 子孙节点 | 左侧节点是右侧节点的子孙 |

## 开发流程

1. **分析目标界面**: 使用快照工具获取界面结构
2. **编写选择器**: 使用选择器语法定位目标节点
3. **配置订阅规则**: 编写 JSON5 格式的规则配置
4. **测试验证**: 在 GKD 应用中测试规则效果
5. **优化性能**: 使用快速查询等优化技巧

## 参考资料

| 参考资料 | 涵盖内容 |
|----------|----------|
| [what-is-gkd](references/what-is-gkd.md) | GKD 基本概念和使用场景 |
| [selector](references/selector.md) | 完整的选择器语法说明 |
| [node](references/node.md) | 节点属性方法参考 |
| [subscription](references/subscription.md) | 订阅规则配置指南 |
| [optimize](references/optimize.md) | 性能优化技巧 |
| [snapshot](references/snapshot.md) | 快照工具使用指南 |
| [example](references/example.md) | 实际应用示例 |

## 注意事项

- 选择器匹配顺序是从右往左匹配
- 正则表达式在不同平台可能有差异
- 使用 `@` 标记目标节点
- 嵌套转义字符需要特别注意
- 快照分享需要使用正确的公开链接