# mediainfo.js - 提取特定信息

## 提取媒体信息

mediainfo.js 提供详细的媒体文件信息，包括通用信息、视频轨道、音频轨道、字幕轨道等。

## 轨道类型

mediainfo.js 将信息按轨道分类：

- **General**: 通用信息（文件名、大小、时长等）
- **Video**: 视频轨道信息
- **Audio**: 音频轨道信息
- **Text**: 字幕轨道信息
- **Image**: 图片轨道信息
- **Menu**: 菜单轨道信息
- **Other**: 其他轨道信息

## 基本提取方法

### 使用 object 格式（推荐）

```typescript
import mediaInfoFactory from 'mediainfo.js'

const mediainfo = await mediaInfoFactory({ format: 'object' })
const result = await mediainfo.analyzeData(file.size, readChunk)
mediainfo.close()

// 获取所有轨道
const tracks = result.media.track
```

### 查找特定类型轨道

```typescript
// 查找 General 轨道
const generalTrack = tracks.find(t => t['@type'] === 'General')

// 查找 Video 轨道
const videoTrack = tracks.find(t => t['@type'] === 'Video')

// 查找 Audio 轨道
const audioTrack = tracks.find(t => t['@type'] === 'Audio')

// 查找所有 Audio 轨道
const audioTracks = tracks.filter(t => t['@type'] === 'Audio')
```

## General 轨道信息

### 常用字段

```typescript
const generalTrack = tracks.find(t => t['@type'] === 'General')

// 文件信息
generalTrack.FileName           // 文件名
generalTrack.FileSize           // 文件大小（字节）
generalTrack.FileExtension      // 文件扩展名

// 媒体信息
generalTrack.Format             // 格式（如 "MPEG-4"）
generalTrack.Duration           // 时长（毫秒）
generalTrack.OverallBitRate     // 总比特率

// 其他
generalTrack.Title              // 标题
generalTrack.Artist             // 艺术家
generalTrack.Album              // 专辑
generalTrack.Date               // 日期
generalTrack.Comment            // 备注
```

### 使用示例

```typescript
function getGeneralInfo(result: MediaInfoResult) {
  const general = result.media.track.find(t => t['@type'] === 'General')

  return {
    filename: general.FileName,
    size: general.FileSize,
    format: general.Format,
    duration: formatDuration(general.Duration),
    bitrate: formatBitrate(general.OverallBitRate),
    title: general.Title || '',
    artist: general.Artist || ''
  }
}

function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)

  return `${hours}:${(minutes % 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`
}

function formatBitrate(bitrate: number): string {
  if (bitrate > 1000000) {
    return `${(bitrate / 1000000).toFixed(2)} Mbps`
  } else if (bitrate > 1000) {
    return `${(bitrate / 1000).toFixed(2)} Kbps`
  }
  return `${bitrate} bps`
}
```

## Video 轨道信息

### 常用字段

```typescript
const videoTrack = tracks.find(t => t['@type'] === 'Video')

// 基本属性
videoTrack.Width              // 宽度（像素）
videoTrack.Height             // 高度（像素）
videoTrack.FrameRate          // 帧率（fps）
videoTrack.FrameCount         // 帧数

// 编码信息
videoTrack.CodecID            // 编码器 ID（如 "avc1", "hev1"）
videoTrack.Codec              // 编码器名称（如 "AVC", "HEVC"）
videoTrack.Profile            // 编码配置文件
videoTrack.Level              // 编码级别

// 比特率
videoTrack.BitRate            // 比特率
videoTrack.BitRate_Mode       // 比特率模式（CBR/VBR）

// 色彩信息
videoTrack.BitDepth           // 位深（如 8, 10）
videoTrack.ChromaSubsampling   // 色彩子采样（如 "4:2:0"）
videoTrack.ColorSpace         // 色彩空间（如 "YUV"）

// 其他
videoTrack.DisplayAspectRatio // 显示宽高比
videoTrack.StreamSize         // 流大小
```

### 使用示例

```typescript
function getVideoInfo(result: MediaInfoResult) {
  const videoTracks = result.media.track.filter(t => t['@type'] === 'Video')

  return videoTracks.map(track => ({
    codec: track.Codec || track.CodecID,
    resolution: `${track.Width}x${track.Height}`,
    frameRate: `${track.FrameRate} fps`,
    bitrate: formatBitrate(track.BitRate),
    bitDepth: track.BitDepth,
    chroma: track.ChromaSubsampling,
    aspectRatio: track.DisplayAspectRatio,
    profile: track.Profile,
    level: track.Level
  }))
}

// 判断视频编码类型
function getVideoCodecType(videoTrack): 'H264' | 'H265' | 'VP9' | 'AV1' | 'Other' {
  const codec = videoTrack.Codec?.toLowerCase() || videoTrack.CodecID?.toLowerCase()

  if (codec.includes('avc') || codec.includes('h.264')) return 'H264'
  if (codec.includes('hevc') || codec.includes('h.265') || codec.includes('h265')) return 'H265'
  if (codec.includes('vp9')) return 'VP9'
  if (codec.includes('av01') || codec.includes('av1')) return 'AV1'
  return 'Other'
}
```

### 高级视频分析

```typescript
function analyzeVideoQuality(videoTrack) {
  const analysis = {
    resolution: getResolutionRating(videoTrack),
    bitrate: getBitrateRating(videoTrack),
    codec: getCodecRating(videoTrack),
    overall: ''
  }

  // 综合评分
  const scores = [
    analysis.resolution.score,
    analysis.bitrate.score,
    analysis.codec.score
  ]
  analysis.overall = scores.reduce((a, b) => a + b, 0) / scores.length

  return analysis
}

function getResolutionRating(videoTrack) {
  const totalPixels = videoTrack.Width * videoTrack.Height

  if (totalPixels >= 3840 * 2160) return { level: '4K', score: 5 }
  if (totalPixels >= 2560 * 1440) return { level: '2K', score: 4 }
  if (totalPixels >= 1920 * 1080) return { level: '1080p', score: 3 }
  if (totalPixels >= 1280 * 720) return { level: '720p', score: 2 }
  return { level: 'SD', score: 1 }
}

function getBitrateRating(videoTrack) {
  const bitrate = videoTrack.BitRate

  if (bitrate >= 20000000) return { level: 'Very High', score: 5 }
  if (bitrate >= 10000000) return { level: 'High', score: 4 }
  if (bitrate >= 5000000) return { level: 'Medium', score: 3 }
  if (bitrate >= 2500000) return { level: 'Low', score: 2 }
  return { level: 'Very Low', score: 1 }
}

function getCodecRating(videoTrack) {
  const codec = getVideoCodecType(videoTrack)

  switch (codec) {
    case 'AV1': return { level: 'Excellent', score: 5 }
    case 'H265': return { level: 'Good', score: 4 }
    case 'VP9': return { level: 'Good', score: 4 }
    case 'H264': return { level: 'Standard', score: 3 }
    default: return { level: 'Basic', score: 2 }
  }
}
```

## Audio 轨道信息

### 常用字段

```typescript
const audioTrack = tracks.find(t => t['@type'] === 'Audio')

// 基本属性
audioTrack.SamplingRate       // 采样率（Hz）
audioTrack.Channels          // 声道数
audioTrack.ChannelPositions   // 声道位置
audioTrack.ChannelLayout      // 声道布局

// 编码信息
audioTrack.CodecID            // 编码器 ID
audioTrack.Codec              // 编码器名称
audioTrack.Profile            // 配置文件

// 比特率
audioTrack.BitRate            // 比特率
audioTrack.BitDepth           // 位深（如 16, 24）

// 语言
audioTrack.Language           // 语言代码（如 "eng", "chi"）

// 其他
audioTrack.StreamSize        // 流大小
```

### 使用示例

```typescript
function getAudioInfo(result: MediaInfoResult) {
  const audioTracks = result.media.track.filter(t => t['@type'] === 'Audio')

  return audioTracks.map(track => ({
    codec: track.Codec || track.CodecID,
    samplingRate: `${track.SamplingRate / 1000} kHz`,
    channels: `${track.Channels} channel${track.Channels > 1 ? 's' : ''}`,
    bitrate: formatBitrate(track.BitRate),
    bitDepth: track.BitDepth,
    language: track.Language || 'unknown',
    layout: track.ChannelLayout
  }))
}

// 判断音频编码类型
function getAudioCodecType(audioTrack): 'AAC' | 'MP3' | 'FLAC' | 'Opus' | 'Other' {
  const codec = audioTrack.Codec?.toLowerCase() || audioTrack.CodecID?.toLowerCase()

  if (codec.includes('aac')) return 'AAC'
  if (codec.includes('mp3')) return 'MP3'
  if (codec.includes('flac')) return 'FLAC'
  if (codec.includes('opus')) return 'Opus'
  return 'Other'
}

// 检查是否为无损音频
function isLossless(audioTrack): boolean {
  const codec = getAudioCodecType(audioTrack)
  return codec === 'FLAC' || codec === 'ALAC'
}
```

## Text 轨道信息（字幕）

### 常用字段

```typescript
const textTrack = tracks.find(t => t['@type'] === 'Text')

// 基本信息
textTrack.CodecID            // 编码器 ID
textTrack.Codec              // 编码器名称
textTrack.Language           // 语言代码

// 其他
textTrack.Title              // 标题
textTrack.Default            // 是否默认
textTrack.Forced             // 是否强制
```

### 使用示例

```typescript
function getSubtitleInfo(result: MediaInfoResult) {
  const textTracks = result.media.track.filter(t => t['@type'] === 'Text')

  return textTracks.map(track => ({
    codec: track.Codec || track.CodecID,
    language: track.Language || 'unknown',
    isDefault: track.Default === 'Yes',
    isForced: track.Forced === 'Yes',
    title: track.Title
  }))
}

// 获取可用的字幕语言
function getAvailableLanguages(result: MediaInfoResult): string[] {
  const textTracks = result.media.track.filter(t => t['@type'] === 'Text')
  const languages = textTracks
    .map(t => t.Language)
    .filter(Boolean)
  return [...new Set(languages)]  // 去重
}
```

## 综合提取示例

### 提取所有媒体信息

```typescript
interface MediaFileInfo {
  general: any
  videos: any[]
  audios: any[]
  subtitles: any[]
}

function extractAllMediaInfo(result: MediaInfoResult): MediaFileInfo {
  const info: MediaFileInfo = {
    general: null,
    videos: [],
    audios: [],
    subtitles: []
  }

  for (const track of result.media.track) {
    switch (track['@type']) {
      case 'General':
        info.general = track
        break
      case 'Video':
        info.videos.push(track)
        break
      case 'Audio':
        info.audios.push(track)
        break
      case 'Text':
        info.subtitles.push(track)
        break
    }
  }

  return info
}

// 使用
const result = await mediainfo.analyzeData(file.size, readChunk)
const info = extractAllMediaInfo(result)

console.log('文件:', info.general.FileName)
console.log('视频轨道:', info.videos.length)
console.log('音频轨道:', info.audios.length)
console.log('字幕轨道:', info.subtitles.length)
```

### 格式化输出

```typescript
function formatMediaInfo(result: MediaInfoResult): string {
  const info = extractAllMediaInfo(result)

  let output = ''

  // General 信息
  output += '=== 文件信息 ===\n'
  output += `文件名: ${info.general.FileName}\n`
  output += `格式: ${info.general.Format}\n`
  output += `大小: ${formatFileSize(info.general.FileSize)}\n`
  output += `时长: ${formatDuration(info.general.Duration)}\n\n`

  // 视频信息
  output += '=== 视频信息 ===\n'
  for (const video of info.videos) {
    output += `编码: ${video.Codec || video.CodecID}\n`
    output += `分辨率: ${video.Width}x${video.Height}\n`
    output += `帧率: ${video.FrameRate} fps\n`
    output += `比特率: ${formatBitrate(video.BitRate)}\n\n`
  }

  // 音频信息
  output += '=== 音频信息 ===\n'
  for (const audio of info.audios) {
    output += `编码: ${audio.Codec || audio.CodecID}\n`
    output += `采样率: ${audio.SamplingRate} Hz\n`
    output += `声道: ${audio.Channels}\n`
    output += `比特率: ${formatBitrate(audio.BitRate)}\n\n`
  }

  // 字幕信息
  if (info.subtitles.length > 0) {
    output += '=== 字幕信息 ===\n'
    for (const sub of info.subtitles) {
      output += `语言: ${sub.Language}\n`
      output += `编码: ${sub.Codec || sub.CodecID}\n\n`
    }
  }

  return output
}

function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let size = bytes
  let unitIndex = 0

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }

  return `${size.toFixed(2)} ${units[unitIndex]}`
}
```

## 特定信息提取

### 检查是否为 HDR 视频

```typescript
function isHDR(videoTrack): boolean {
  const transfer = videoTrack.Transfer_Characteristics?.toLowerCase()
  const colourPrimaries = videoTrack.colour_primaries?.toLowerCase()

  return transfer?.includes('pq') ||
         transfer?.includes('hlg') ||
         colourPrimaries?.includes('bt.2020')
}
```

### 检查音频是否为 Dolby Atmos

```typescript
function isDolbyAtmos(audioTrack): boolean {
  const codec = audioTrack.Codec?.toLowerCase()
  const layout = audioTrack.ChannelLayout?.toLowerCase()

  return codec?.includes('atmos') ||
         layout?.includes('object based')
}
```

### 获取视频旋转角度

```typescript
function getRotation(videoTrack): number {
  const rotation = videoTrack.Rotation || videoTrack['rotate']

  if (typeof rotation === 'string') {
    return parseInt(rotation.replace(/[^\d]/g, ''), 10)
  }

  return 0
}
```

### 检查是否为变帧率视频

```typescript
function isVFR(videoTrack): boolean {
  return videoTrack.FrameRate_Mode?.toLowerCase() === 'vfr' ||
         videoTrack.FrameRate?.includes('-')
}
```

## 完整示例：媒体信息查看器

```typescript
class MediaInfoViewer {
  private mediainfo: MediaInfo | null = null

  async initialize() {
    this.mediainfo = await mediaInfoFactory({ format: 'object' })
  }

  async analyze(file: File): Promise<MediaFileInfo> {
    if (!this.mediainfo) {
      await this.initialize()
    }

    const readChunk = async (chunkSize: number, offset: number) =>
      new Uint8Array(await file.slice(offset, offset + chunkSize).arrayBuffer())

    const result = await this.mediainfo!.analyzeData(file.size, readChunk)
    return extractAllMediaInfo(result)
  }

  getSummary(info: MediaFileInfo): string {
    const video = info.videos[0]
    const audio = info.audios[0]

    return [
      `文件: ${info.general.FileName}`,
      `时长: ${formatDuration(info.general.Duration)}`,
      `大小: ${formatFileSize(info.general.FileSize)}`,
      `视频: ${video.Codec} ${video.Width}x${video.Height}`,
      `音频: ${audio.Codec} ${audio.SamplingRate}Hz ${audio.Channels}ch`,
      `字幕: ${info.subtitles.length} 条`
    ].join('\n')
  }

  destroy() {
    if (this.mediainfo) {
      this.mediainfo.close()
      this.mediainfo = null
    }
  }
}

// 使用
const viewer = new MediaInfoViewer()
const info = await viewer.analyze(file)
console.log(viewer.getSummary(info))
viewer.destroy()
```
