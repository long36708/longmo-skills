# mediainfo.js - 输出格式说明

## 格式类型

mediainfo.js 支持 5 种输出格式，通过 `format` 选项指定：

```typescript
type FormatType = 'object' | 'JSON' | 'XML' | 'HTML' | 'text'
```

## 1. object 格式（推荐）

返回结构化的 JavaScript 对象，易于程序化处理。

### 初始化

```typescript
const mediainfo = await mediaInfoFactory({ format: 'object' })
```

### 结果结构

```typescript
type MediaInfoResult = {
  media: {
    '@ref': string
    track: Array<{
      '@type': 'General' | 'Video' | 'Audio' | 'Text' | 'Image' | 'Menu' | 'Other'
      // 各种媒体属性...
    }>
  }
}
```

### 使用示例

```typescript
const result = await mediainfo.analyzeData(file.size, readChunk)

// 获取所有轨道
const tracks = result.media.track

// 查找视频轨道
const videoTrack = tracks.find(t => t['@type'] === 'Video')

// 查找音频轨道
const audioTrack = tracks.find(t => t['@type'] === 'Audio')

// 访问特定属性
console.log('视频分辨率:', videoTrack.Width, 'x', videoTrack.Height)
console.log('视频编码:', videoTrack.CodecID)
console.log('音频编码:', audioTrack.CodecID)
console.log('音频采样率:', audioTrack.SamplingRate)
```

### 典型数据结构

```json
{
  "media": {
    "@ref": "/media/1",
    "track": [
      {
        "@type": "General",
        "FileName": "video.mp4",
        "FileSize": "15728640",
        "Duration": "60000",
        "Format": "MPEG-4"
      },
      {
        "@type": "Video",
        "CodecID": "avc1",
        "Width": 1920,
        "Height": 1080,
        "FrameRate": 30.0,
        "BitRate": 5000000
      },
      {
        "@type": "Audio",
        "CodecID": "mp4a",
        "SamplingRate": 48000,
        "Channels": 2,
        "BitRate": 128000
      }
    ]
  }
}
```

### 类型转换

`object` 格式会自动将某些字符串字段转换为正确的类型：

- 数字字符串 → `number`（如 `"1920"` → `1920`）
- 浮点数字符串 → `number`（如 `"30.0"` → `30.0`）

## 2. JSON 格式

返回 JSON 字符串。

### 初始化

```typescript
const mediainfo = await mediaInfoFactory({ format: 'JSON' })
```

### 使用示例

```typescript
const jsonResult = await mediainfo.analyzeData(file.size, readChunk)

// 解析 JSON
const parsed = JSON.parse(jsonResult)
console.log(parsed)
```

### 特点

- 字符串格式，可以直接存储或传输
- 所有字段都是字符串，需要手动转换类型
- 与 `object` 格式相同的数据结构

### 使用场景

- 需要将结果存储到数据库
- 需要通过网络传输
- 需要保存为文件

```typescript
// 保存到文件
import { writeFileSync } from 'fs'

const jsonResult = await mediainfo.analyzeData(file.size, readChunk)
writeFileSync('media-info.json', jsonResult)
```

## 3. XML 格式

返回 XML 格式的字符串。

### 初始化

```typescript
const mediainfo = await mediaInfoFactory({ format: 'XML' })
```

### 使用示例

```typescript
const xmlResult = await mediainfo.analyzeData(file.size, readChunk)

// 解析 XML
const parser = new DOMParser()
const xmlDoc = parser.parseFromString(xmlResult, 'text/xml')

// 查询元素
const videoTracks = xmlDoc.getElementsByTagName('track')
for (const track of videoTracks) {
  if (track.getAttribute('type') === 'Video') {
    console.log('视频轨道:', track.textContent)
  }
}
```

### 典型输出

```xml
<?xml version="1.0" encoding="UTF-8"?>
<MediaInfo xmlns="https://mediaarea.net/mediainfo">
  <media ref="/media/1">
    <track type="General">
      <FileName>video.mp4</FileName>
      <FileSize>15728640</FileSize>
    </track>
    <track type="Video">
      <Width>1920</Width>
      <Height>1080</Height>
    </track>
  </media>
</MediaInfo>
```

### 使用场景

- 与需要 XML 格式的系统集成
- 需要使用 XPath 查询
- 需要转换为其他格式

### XPath 查询示例

```typescript
const xmlResult = await mediainfo.analyzeData(file.size, readChunk)
const xmlDoc = parser.parseFromString(xmlResult, 'text/xml')

// 使用 XPath 查询
const evaluate = (xpath: string) => {
  return xmlDoc.evaluate(xpath, xmlDoc, null, XPathResult.STRING_TYPE, null).stringValue
}

const width = evaluate('//track[@type="Video"]/Width')
const height = evaluate('//track[@type="Video"]/Height')
console.log(`分辨率: ${width}x${height}`)
```

## 4. HTML 格式

返回 HTML 格式的字符串，适合在网页中显示。

### 初始化

```typescript
const mediainfo = await mediaInfoFactory({ format: 'HTML' })
```

### 使用示例

```typescript
const htmlResult = await mediainfo.analyzeData(file.size, readChunk)

// 直接插入网页
document.getElementById('output').innerHTML = htmlResult
```

### 典型输出

```html
<table>
  <tr>
    <td>Complete name</td>
    <td>video.mp4</td>
  </tr>
  <tr>
    <td>Format</td>
    <td>MPEG-4</td>
  </tr>
  <tr>
    <td>File size</td>
    <td>15 MiB</td>
  </tr>
</table>
```

### 使用场景

- 在网页中直接显示媒体信息
- 生成报告
- 用户界面展示

```typescript
// React 组件中显示
function MediaInfoDisplay({ file }) {
  const [html, setHtml] = useState('')

  useEffect(() => {
    mediaInfoFactory({ format: 'HTML' }).then(async (mi) => {
      const result = await mi.analyzeData(file.size, readChunk)
      setHtml(result)
      mi.close()
    })
  }, [file])

  return <div dangerouslySetInnerHTML={{ __html: html }} />
}
```

## 5. text 格式

返回纯文本格式，类似命令行工具的输出。

### 初始化

```typescript
const mediainfo = await mediaInfoFactory({ format: 'text' })
```

### 使用示例

```typescript
const textResult = await mediainfo.analyzeData(file.size, readChunk)

// 显示文本
console.log(textResult)

// 或在预元素中显示
document.getElementById('output').textContent = textResult
```

### 典型输出

```
General
Complete name                            : video.mp4
Format                                   : MPEG-4
File size                                : 15 MiB

Video
Format                                   : AVC
Width                                    : 1920 pixels
Height                                   : 1080 pixels
Frame rate                               : 30.0 fps

Audio
Format                                   : AAC
Sampling rate                            : 48.0 kHz
Channels                                 : 2 channels
```

### 使用场景

- 命令行工具输出
- 日志记录
- 简单的文本显示
- 与其他文本处理工具集成

```typescript
// 搜索特定信息
const textResult = await mediainfo.analyzeData(file.size, readChunk)

// 提取视频分辨率
const widthMatch = textResult.match(/Width\s*:\s*(\d+)/)
const heightMatch = textResult.match(/Height\s*:\s*(\d+)/)

if (widthMatch && heightMatch) {
  console.log(`分辨率: ${widthMatch[1]}x${heightMatch[1]}`)
}
```

## 格式对比

| 格式 | 返回类型 | 易用性 | 程序化处理 | 文件大小 | 适用场景 |
|------|---------|--------|-----------|---------|---------|
| `object` | Object | ★★★★★ | ★★★★★ | 中 | 开发、数据分析 |
| `JSON` | String | ★★★★☆ | ★★★★☆ | 中 | 存储、传输 |
| `XML` | String | ★★★☆☆ | ★★★☆☆ | 大 | XML 系统集成 |
| `HTML` | String | ★★★★☆ | ★★☆☆☆ | 大 | 网页显示 |
| `text` | String | ★★★★★ | ★★☆☆☆ | 小 | 文本显示、日志 |

## 格式转换

### 从 object 转换为其他格式

```typescript
const result = await mediainfo.analyzeData(file.size, readChunk)

// 转为 JSON 字符串
const jsonString = JSON.stringify(result, null, 2)

// 转为简化 HTML
function objectToHTML(result: MediaInfoResult): string {
  let html = '<table>\n'

  for (const track of result.media.track) {
    html += `<tr><td colspan="2"><strong>${track['@type']}</strong></td></tr>\n`

    for (const [key, value] of Object.entries(track)) {
      if (key !== '@type') {
        html += `<tr><td>${key}</td><td>${value}</td></tr>\n`
      }
    }
  }

  html += '</table>'
  return html
}
```

### 从 text 提取结构化数据

```typescript
const textResult = await mediainfo.analyzeData(file.size, readChunk)

function parseTextFormat(text: string) {
  const tracks: Record<string, Record<string, string>> = {}
  let currentTrack = null

  for (const line of text.split('\n')) {
    const trackMatch = line.match(/^(\w+)$/)
    if (trackMatch) {
      currentTrack = trackMatch[1]
      tracks[currentTrack] = {}
      continue
    }

    const valueMatch = line.match(/^(\w[^:]+)\s*:\s*(.+)$/)
    if (valueMatch && currentTrack) {
      const [, key, value] = valueMatch
      tracks[currentTrack][key.trim()] = value.trim()
    }
  }

  return tracks
}

const structured = parseTextFormat(textResult)
console.log(structured)
```

## 完整示例

### 多格式输出

```typescript
async function analyzeInMultipleFormats(file: File) {
  const formats = ['object', 'JSON', 'XML', 'HTML', 'text'] as const
  const results = new Map<FormatType, any>()

  for (const format of formats) {
    const mediainfo = await mediaInfoFactory({ format })
    const result = await mediainfo.analyzeData(file.size, readChunk)
    results.set(format, result)
    mediainfo.close()
  }

  return results
}

// 使用
const results = await analyzeInMultipleFormats(file)

// object 格式: 程序化处理
const videoWidth = results.get('object').media.track.find(t => t['@type'] === 'Video').Width

// text 格式: 显示给用户
console.log(results.get('text'))

// JSON 格式: 保存到文件
writeFileSync('info.json', results.get('JSON'))
```

### 根据需求选择格式

```typescript
async function analyzeFile(file: File, purpose: 'display' | 'storage' | 'analysis') {
  let format: FormatType

  switch (purpose) {
    case 'display':
      format = 'HTML'  // 适合网页显示
      break
    case 'storage':
      format = 'JSON'  // 适合存储
      break
    case 'analysis':
      format = 'object'  // 适合程序化处理
      break
  }

  const mediainfo = await mediaInfoFactory({ format })
  const result = await mediainfo.analyzeData(file.size, readChunk)
  mediainfo.close()

  return result
}

// 使用
const displayResult = await analyzeFile(file, 'display')
document.getElementById('output').innerHTML = displayResult

const storageResult = await analyzeFile(file, 'storage')
localStorage.setItem('mediaInfo', storageResult)

const analysisResult = await analyzeFile(file, 'analysis')
const videoTrack = analysisResult.media.track.find(t => t['@type'] === 'Video')
```

## 性能考虑

- `object` 和 `JSON` 格式需要解析 JSON，相对较慢
- `text` 格式解析最快
- `HTML` 和 `XML` 格式输出较大，传输和存储开销较高

建议根据使用场景选择合适的格式，以获得最佳性能。
