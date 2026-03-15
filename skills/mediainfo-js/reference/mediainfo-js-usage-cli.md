# mediainfo.js CLI 使用指南

mediainfo.js 提供了命令行接口（CLI），允许直接在终端中分析媒体文件信息。

## 前置要求

使用 CLI 之前，必须先构建项目：

```bash
# 构建项目
pnpm build
# 或
npm run build
```

构建后会在 `dist/esm/` 目录生成 CLI 可执行文件。

## 基本用法

### 方式 1: 使用 npx（推荐）

```bash
npx mediainfo.js <file>
```

### 方式 2: 直接运行构建后的文件

```bash
node dist/esm/cli.js <file>
```

### 方式 3: 全局安装后使用

```bash
# 先构建
pnpm build

# 链接到全局
pnpm link --global

# 然后可以在任何地方使用
mediainfo.js <file>
```

## 命令行选项

| 选项 | 简写 | 类型 | 说明 | 默认值 |
|------|------|------|------|--------|
| `--format` | `-f` | string | 输出格式（见下文） | text |
| `--cover-data` | - | boolean | 输出封面数据为 base64 | false |
| `--full` | - | boolean | 显示完整信息（所有内部标签） | false |
| `--help` | `-h` | - | 显示帮助信息 | - |

## 输出格式

`--format` 选项支持以下格式：

- `object` - JavaScript 对象格式
- `JSON` - JSON 字符串格式
- `XML` - XML 格式
- `text` - 纯文本格式（默认）
- `text` - 文本格式

**注意**: 使用 `--cover-data` 时必须配合 `--format JSON` 或 `--format XML`，否则会报错。

## 使用示例

### 基本信息查询

```bash
# 查看视频文件信息（默认文本格式）
mediainfo.js video.mp4

# 查看音频文件信息
mediainfo.js audio.mp3
```

### 指定输出格式

```bash
# 输出 JSON 格式
mediainfo.js --format JSON video.mp4
# 或使用简写
mediainfo.js -f JSON video.mp4

# 输出 XML 格式
mediainfo.js -f XML video.mp4

# 输出对象格式
mediainfo.js -f object video.mp4
```

### 获取完整信息

```bash
# 显示所有内部标签
mediainfo.js --full video.mp4

# 结合 JSON 格式
mediainfo.js --full --format JSON video.mp4
```

### 提取封面数据

```bash
# 提取封面数据为 base64（必须使用 JSON 或 XML 格式）
mediainfo.js --cover-data --format JSON video.mp4

# 提取封面数据并显示完整信息
mediainfo.js --cover-data --full -f XML video.mp4
```

### 查看帮助

```bash
# 显示帮助信息
mediainfo.js --help
# 或
mediainfo.js -h
```

## 综合示例

### 场景 1: 快速检查视频编码信息

```bash
mediainfo.js video.mp4
```

### 场景 2: 导出 JSON 数据用于程序处理

```bash
mediainfo.js -f JSON video.mp4 > video-info.json
```

### 场景 3: 获取包含封面的完整媒体信息

```bash
mediainfo.js --cover-data --full -f JSON video.mp4
```

### 场景 4: 批量分析多个文件

```bash
# 使用脚本批量处理
for file in *.mp4; do
  mediainfo.js -f JSON "$file" > "$file-info.json"
done
```

## 错误处理

### 常见错误

1. **No file received!**
   - 未指定文件路径
   - 解决：在命令后添加文件路径

2. **For cover data you need to choose JSON or XML as output format!**
   - 使用 `--cover-data` 但未指定 JSON/XML 格式
   - 解决：添加 `--format JSON` 或 `--format XML`

3. **File unavailable**
   - 文件不存在或无法访问
   - 解决：检查文件路径和权限

### 错误退出

遇到错误时，CLI 会：
- 显示错误信息到 stderr
- 显示帮助信息
- 以退出码 1 退出

## 技术细节

### 实现原理

- CLI 入口文件：`src/cli.ts`
- 构建后路径：`dist/esm/cli.js`
- 使用 yargs 解析命令行参数
- 使用 Node.js 文件系统 API 读取文件

### 文件读取机制

CLI 使用分块读取的方式处理大文件：
1. 打开文件获取文件大小
2. 创建 MediaInfo 实例
3. 分块读取文件数据并传递给 MediaInfo
4. 输出分析结果
5. 关闭文件和 MediaInfo 实例

## 性能建议

- 对于大文件，建议使用 `--format JSON` 以减少输出量
- 如果只需要基本信息，不要使用 `--full` 选项
- 批量处理时，考虑使用脚本并行处理

## 相关资源

- [安装指南](mediainfo-js-installation.md) - 如何安装和配置
- [输出格式说明](mediainfo-js-usage-formats.md) - 各输出格式的详细说明
- [数据分析方法](mediainfo-js-usage-analyze.md) - MediaInfo 分析方法详解
- [提取特定信息](mediainfo-js-usage-extract-info.md) - 如何提取特定的媒体信息
