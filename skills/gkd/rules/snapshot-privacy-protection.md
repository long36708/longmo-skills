---
title: 保护快照中的隐私信息
impact: MEDIUM
description: 在分享快照前，需要处理截图和节点信息中的敏感数据，保护用户隐私。
tags: snapshot, privacy, security, sensitive-data, sharing
---

# 保护快照中的隐私信息

## 问题

快照包含界面截图和节点信息，可能泄露用户名、聊天内容等敏感信息，直接分享存在隐私风险。

## 错误示例

```json5
// BUG: 快照中包含未处理的敏感信息
{
  snapshotUrls: ['https://i.gkd.li/i/12345678'],  // 包含真实用户名的截图
  rules: {
    matches: 'TextView[text="张三"]',  // 包含真实姓名
  },
}
```

## 正确示例

```json5
// 正确：使用处理后的快照和通用选择器
{
  snapshotUrls: ['https://i.gkd.li/i/12345678'],  // 已打码的截图
  rules: {
    matches: 'TextView[text*="用户"]',  // 使用通用文本匹配
  },
}
```

## 隐私保护方法

### 截图处理

1. **保存到相册编辑**
   - 在 GKD 快照记录界面保存截图到相册
   - 使用图片编辑工具打马赛克或模糊处理敏感区域
   - 回到 GKD 界面替换处理后的截图

2. **使用透明图片替代**
   ```text
   // Android <= 10 且未开启截屏服务时
   GKD 会自动使用同尺寸透明图片作为截图
   ```

### 节点信息处理

1. **解压缩快照文件**
   ```bash
   # 解压快照 zip 文件
   unzip snapshot.zip
   ```

2. **编辑 JSON 文件**
   ```json
   // 处理前：包含真实信息
   {
     "text": "张三的聊天记录",
     "desc": "用户个人资料"
   }
   
   // 处理后：替换为通用内容
   {
     "text": "***的聊天记录",
     "desc": "用户个人资料"
   }
   ```

3. **重新压缩**
   ```bash
   # 重新打包为 zip
   zip -r processed_snapshot.zip .
   ```

## 最佳实践

### 使用通用选择器

```text
// 避免使用具体用户名
TextView[text="张三"]  // ❌ 不推荐

// 使用通用模式匹配
TextView[text*="用户"]  // ✅ 推荐
TextView[text$="的聊天"]  // ✅ 推荐
```

### 快照分享规范

1. **使用公开链接**
   ```text
   // 错误：使用本地链接
   https://i.gkd.li/snapshot/1734099604908
   
   // 正确：使用公开分享链接
   https://i.gkd.li/i/18135562
   ```

2. **验证分享链接**
   - 在其他设备打开链接确认可访问
   - 检查敏感信息是否已处理

## 实际应用场景

### 社交应用规则

```json5
{
  // 使用通用选择器，避免具体用户名
  rules: {
    matches: 'TextView[text*="好友"][text.length<10]',
  },
  // 使用处理后的快照
  snapshotUrls: ['https://i.gkd.li/i/已处理的快照'],
}
```

### 金融应用规则

```json5
{
  // 避免匹配具体金额
  rules: {
    matches: 'TextView[text$="元"][text.length<20]',
  },
  // 金额区域必须打码
  snapshotUrls: ['https://i.gkd.li/i/金额已打码的快照'],
}
```

## 原因

隐私保护措施确保：
1. **用户安全**: 防止个人信息泄露
2. **合规性**: 符合数据保护法规要求
3. **社区信任**: 建立安全的分享环境