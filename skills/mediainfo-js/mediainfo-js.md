# mediainfo.js

MediaInfo.js 是 MediaInfoLib 的 WebAssembly 版本,可以从视频和音频文件中提取详细信息,支持浏览器和 Node.js 环境。

## 触发条件

当用户需要:
- 从视频/音频文件中提取元数据信息(编码、分辨率、时长、比特率等)
- 分析媒体文件格式和技术参数
- 在浏览器或 Node.js 中处理媒体文件信息
- 获取音视频轨道的详细信息

## 参考文档

本技能已拆分为多个参考文档，请根据使用场景查阅：

- [installation.md](referenceediainfo-js-installation.md) - 安装与基本配置
- [browser-setup-vite.md](referenceediainfo-js-browser-setup-vite.md) - Vite 项目浏览器配置
- [browser-setup-webpack.md](referenceediainfo-js-browser-setup-webpack.md) - Webpack 项目浏览器配置
- [browser-setup-angular.md](referenceediainfo-js-browser-setup-angular.md) - Angular 项目浏览器配置
- [browser-setup-umd.md](referenceediainfo-js-browser-setup-umd.md) - UMD/CMD 浏览器配置
- [usage-cli.md](referenceediainfo-js-usage-cli.md) - 命令行工具（CLI）使用
- [usage-analyze.md](referenceediainfo-js-usage-analyze.md) - 数据分析方法
- [usage-formats.md](referenceediainfo-js-usage-formats.md) - 输出格式说明
- [usage-extract-info.md](referenceediainfo-js-usage-extract-info.md) - 提取特定信息
- [best-practices.md](reference/mediainfo-js-best-practices.md) - 最佳实践与注意事项

## 快速开始

### 命令行工具（CLI）

```bash
# 安装
npm install mediainfo.js

# 构建项目（必须先构建）
pnpm build

# 使用 CLI 分析文件
npx mediainfo.js video.mp4

# 输出 JSON 格式
npx mediainfo.js -f JSON video.mp4
```

详细 CLI 用法请参考 [CLI 使用指南](referenceediainfo-js-usage-cli.md)。

### Node.js 环境

```bash
npm install mediainfo.js
```

```typescript
import mediaInfoFactory from 'mediainfo.js'

const mediainfo = await mediaInfoFactory({ format: 'object' })
const result = await mediainfo.analyzeData(
  fileStat.size,
  (chunkSize, offset) => {
    // 读取文件块的实现
  }
)
console.log(result)
mediainfo.close()
```

### 浏览器环境

浏览器环境配置较为复杂，请根据使用的框架查阅对应的参考文档：
- Vite: [browser-setup-vite.md](referenceediainfo-js-browser-setup-vite.md)
- Webpack: [browser-setup-webpack.md](referenceediainfo-js-browser-setup-webpack.md)
- Angular: [browser-setup-angular.md](referenceediainfo-js-browser-setup-angular.md)
- UMD: [browser-setup-umd.md](referenceediainfo-js-browser-setup-umd.md)

## 支持的文件类型

- 视频: MP4, AVI, MKV, MOV, WMV, FLV, WebM 等
- 音频: MP3, AAC, FLAC, OGG, WAV, M4A 等
- 其他: 各种容器格式和编解码器

## 参考资源

- 官方文档: https://mediainfo.js.org/docs/
- API 文档: https://mediainfo.js.org/api/
- 在线演示: https://mediainfo.js.org/demo
- GitHub: https://github.com/buzz/mediainfo.js
