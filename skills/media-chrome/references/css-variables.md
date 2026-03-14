# Media Chrome CSS 变量参考

本文档列出了 Media Chrome 中所有可用的 CSS 变量，用于自定义组件样式。

## 全局变量

### 通用变量

```css
:root {
  --media-control-background: rgba(0, 0, 0, 0.7);
  --media-control-hover-background: rgba(0, 0, 0, 0.9);
  --media-primary-color: #3b82f6;
  --media-text-color: #ffffff;
  --media-font-family: sans-serif;
  --media-font-size: 16px;
}
```

## MediaController 变量

```css
media-controller {
  /* 控制条显示/隐藏的过渡时间 */
  --media-controller-transition: opacity 0.25s;

  /* 控制条自动隐藏的延迟时间 */
  --media-controls-hover-display-time: 2s;

  /* 控制条布局方向 */
  --media-control-bar-layout: row;
}
```

## 按钮组件变量

### MediaChromeButton (通用按钮)

```css
media-chrome-button {
  /* 按钮显示方式 */
  --media-button-display: inline-flex;

  /* 按钮尺寸 */
  --media-button-width: 40px;
  --media-button-height: 40px;

  /* 按钮内边距 */
  --media-button-padding: 8px;

  /* 背景色 */
  --media-button-background: transparent;
  --media-button-hover-background: rgba(255, 255, 255, 0.1);

  /* 圆角 */
  --media-button-border-radius: 4px;

  /* 过渡效果 */
  --media-button-transition: background-color 0.15s;

  /* 图标颜色 */
  --media-icon-color: #ffffff;
  --media-icon-hover-color: #ffffff;

  /* 禁用状态 */
  --media-button-disabled-opacity: 0.4;
}
```

### MediaPlayButton

```css
media-play-button {
  --media-play-button-display: inline-flex;
  --media-play-button-width: 40px;
  --media-play-button-height: 40px;
}
```

### MediaMuteButton

```css
media-mute-button {
  --media-mute-button-display: inline-flex;
  --media-mute-button-width: 40px;
  --media-mute-button-height: 40px;
}
```

### MediaFullscreenButton

```css
media-fullscreen-button {
  --media-fullscreen-button-display: inline-flex;
  --media-fullscreen-button-width: 40px;
  --media-fullscreen-button-height: 40px;
}
```

### MediaPipButton

```css
media-pip-button {
  --media-pip-button-display: inline-flex;
  --media-pip-button-width: 40px;
  --media-pip-button-height: 40px;
}
```

### MediaAirplayButton

```css
media-airplay-button {
  --media-airplay-button-display: inline-flex;
  --media-airplay-button-width: 40px;
  --media-airplay-button-height: 40px;
}
```

### MediaCastButton

```css
media-cast-button {
  --media-cast-button-display: inline-flex;
  --media-cast-button-width: 40px;
  --media-cast-button-height: 40px;
}
```

### MediaCaptionsButton

```css
media-captions-button {
  --media-captions-button-display: inline-flex;
  --media-captions-button-width: 40px;
  --media-captions-button-height: 40px;
}
```

### MediaPlaybackRateButton

```css
media-playback-rate-button {
  --media-playback-rate-button-display: inline-flex;
  --media-playback-rate-button-width: 40px;
  --media-playback-rate-button-height: 40px;
}
```

### MediaSeekBackwardButton

```css
media-seek-backward-button {
  --media-seek-backward-button-display: inline-flex;
  --media-seek-backward-button-width: 40px;
  --media-seek-backward-button-height: 40px;
}
```

### MediaSeekForwardButton

```css
media-seek-forward-button {
  --media-seek-forward-button-display: inline-flex;
  --media-seek-forward-button-width: 40px;
  --media-seek-forward-button-height: 40px;
}
```

## 范围组件变量

### MediaChromeRange (通用范围控件)

```css
media-chrome-range {
  /* 显示方式 */
  --media-range-display: inline-flex;

  /* 尺寸 */
  --media-range-height: 6px;
  --media-range-thumb-size: 14px;

  /* 颜色 */
  --media-range-track-background: rgba(255, 255, 255, 0.2);
  --media-range-track-progress-background: var(--media-primary-color);
  --media-range-thumb-background: #ffffff;

  /* 过渡效果 */
  --media-range-transition: all 0.15s;

  /* 光标样式 */
  --media-range-cursor: pointer;
}
```

### MediaTimeRange

```css
media-time-range {
  --media-time-range-display: inline-flex;
  --media-time-range-height: 6px;
  --media-time-range-thumb-size: 14px;
  --media-time-range-thumb-display: block;
  --media-time-range-thumb-border-radius: 50%;

  /* 已播放进度颜色 */
  --media-time-range-played-color: var(--media-primary-color);
  --media-time-range-buffered-color: rgba(255, 255, 255, 0.4);

  /* 悬停效果 */
  --media-time-range-hover-height: 8px;
}
```

### MediaVolumeRange

```css
media-volume-range {
  --media-volume-range-display: inline-flex;
  --media-volume-range-height: 6px;
  --media-volume-range-thumb-size: 14px;
  --media-volume-range-thumb-display: block;

  /* 音量颜色 */
  --media-volume-range-level-color: var(--media-primary-color);
}
```

## 显示组件变量

### MediaTimeDisplay

```css
media-time-display {
  --media-time-display-display: inline-block;
  --media-time-display-font-size: 14px;
  --media-time-display-color: #ffffff;
  --media-time-display-font-weight: normal;
  --media-time-display-padding: 0 10px;
}
```

### MediaDurationDisplay

```css
media-duration-display {
  --media-duration-display-display: inline-block;
  --media-duration-display-font-size: 14px;
  --media-duration-display-color: #ffffff;
  --media-duration-display-font-weight: normal;
  --media-duration-display-padding: 0 10px;
}
```

### MediaTextDisplay

```css
media-text-display {
  --media-text-display-display: inline-block;
  --media-text-display-font-size: 14px;
  --media-text-display-color: #ffffff;
  --media-text-display-font-weight: normal;
}
```

### MediaPreviewThumbnail

```css
media-preview-thumbnail {
  --media-preview-thumbnail-display: block;
  --media-preview-thumbnail-width: 160px;
  --media-preview-thumbnail-height: 90px;
  --media-preview-thumbnail-border-radius: 4px;
  --media-preview-thumbnail-border: 1px solid rgba(255, 255, 255, 0.2);
}
```

### MediaPreviewTimeDisplay

```css
media-preview-time-display {
  --media-preview-time-display-display: block;
  --media-preview-time-display-font-size: 12px;
  --media-preview-time-display-color: #ffffff;
  --media-preview-time-display-font-weight: normal;
}
```

### MediaPreviewChapterDisplay

```css
media-preview-chapter-display {
  --media-preview-chapter-display-display: block;
  --media-preview-chapter-display-font-size: 12px;
  --media-preview-chapter-display-color: #ffffff;
  --media-preview-chapter-display-font-weight: normal;
}
```

## MediaControlBar 变量

```css
media-control-bar {
  /* 布局方向 */
  --media-control-bar-layout: row;

  /* 背景样式 */
  --media-control-bar-background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  --media-control-bar-padding: 10px;

  /* 对齐方式 */
  --media-control-bar-align-items: center;
  --media-control-bar-justify-content: space-between;

  /* 间距 */
  --media-control-bar-gap: 8px;

  /* 显示/隐藏动画 */
  --media-control-bar-opacity: 1;
  --media-control-bar-transition: opacity 0.25s;
}
```

## MediaLoadingIndicator 变量

```css
media-loading-indicator {
  --media-loading-indicator-display: flex;
  --media-loading-indicator-size: 48px;
  --media-loading-indicator-color: #ffffff;
  --media-loading-indicator-border-width: 4px;
  --media-loading-indicator-border-color: rgba(255, 255, 255, 0.2);
  --media-loading-indicator-border-top-color: #ffffff;
}
```

## MediaPosterImage 变量

```css
media-poster-image {
  --media-poster-image-display: block;
  --media-poster-image-width: 100%;
  --media-poster-image-height: 100%;
  --media-poster-image-object-fit: cover;
  --media-poster-image-opacity: 1;
  --media-poster-image-transition: opacity 0.3s;
}
```

## MediaTooltip 变量

```css
media-tooltip {
  --media-tooltip-display: inline-block;
  --media-tooltip-font-size: 12px;
  --media-tooltip-color: #ffffff;
  --media-tooltip-background: rgba(0, 0, 0, 0.8);
  --media-tooltip-padding: 6px 10px;
  --media-tooltip-border-radius: 4px;
  --media-tooltip-margin-top: 8px;
}
```

## MediaChromeDialog 变量

```css
media-chrome-dialog {
  --media-dialog-display: block;
  --media-dialog-background: rgba(0, 0, 0, 0.9);
  --media-dialog-color: #ffffff;
  --media-dialog-padding: 20px;
  --media-dialog-border-radius: 8px;
  --media-dialog-max-width: 400px;
}
```

## MediaErrorDialog 变量

```css
media-error-dialog {
  --media-error-dialog-display: block;
  --media-error-dialog-background: rgba(220, 38, 38, 0.95);
  --media-error-dialog-color: #ffffff;
  --media-error-dialog-padding: 16px;
  --media-error-dialog-border-radius: 8px;
  --media-error-dialog-font-size: 14px;
}
```

## 菜单组件变量

### MediaChromeMenu

```css
media-chrome-menu {
  --media-menu-display: block;
  --media-menu-background: rgba(0, 0, 0, 0.95);
  --media-menu-color: #ffffff;
  --media-menu-padding: 8px 0;
  --media-menu-border-radius: 8px;
  --media-menu-min-width: 200px;
  --media-menu-max-height: 300px;
  --media-menu-overflow-y: auto;
}
```

### MediaSettingsMenu

```css
media-settings-menu {
  --media-settings-menu-display: block;
  --media-settings-menu-background: rgba(0, 0, 0, 0.95);
  --media-settings-menu-color: #ffffff;
  --media-settings-menu-padding: 8px 0;
}
```

### MediaCaptionsMenu

```css
media-captions-menu {
  --media-captions-menu-display: block;
  --media-captions-menu-background: rgba(0, 0, 0, 0.95);
  --media-captions-menu-color: #ffffff;
}
```

### MediaPlaybackRateMenu

```css
media-playback-rate-menu {
  --media-playback-rate-menu-display: block;
  --media-playback-rate-menu-background: rgba(0, 0, 0, 0.95);
  --media-playback-rate-menu-color: #ffffff;
}
```

### MediaRenditionMenu

```css
media-rendition-menu {
  --media-rendition-menu-display: block;
  --media-rendition-menu-background: rgba(0, 0, 0, 0.95);
  --media-rendition-menu-color: #ffffff;
}
```

### MediaAudioTrackMenu

```css
media-audio-track-menu {
  --media-audio-track-menu-display: block;
  --media-audio-track-menu-background: rgba(0, 0, 0, 0.95);
  --media-audio-track-menu-color: #ffffff;
}
```

## 响应式变量

### 移动端特定样式

```css
@media (max-width: 768px) {
  media-control-bar {
    --media-control-bar-padding: 8px;
    --media-control-bar-gap: 4px;
  }

  media-chrome-button {
    --media-button-width: 36px;
    --media-button-height: 36px;
  }
}
```

### 桌面端特定样式

```css
@media (min-width: 769px) {
  media-control-bar {
    --media-control-bar-padding: 12px;
    --media-control-bar-gap: 10px;
  }

  media-chrome-button {
    --media-button-width: 44px;
    --media-button-height: 44px;
  }
}
```

## 自定义主题示例

### 暗色主题（默认）

```css
media-controller {
  --media-control-background: rgba(0, 0, 0, 0.7);
  --media-control-hover-background: rgba(0, 0, 0, 0.9);
  --media-primary-color: #3b82f6;
  --media-text-color: #ffffff;
}
```

### 亮色主题

```css
media-controller {
  --media-control-background: rgba(255, 255, 255, 0.9);
  --media-control-hover-background: rgba(255, 255, 255, 1);
  --media-primary-color: #3b82f6;
  --media-text-color: #000000;
  --media-icon-color: #000000;
}
```

### 品牌主题

```css
media-controller {
  --media-primary-color: #ff5722;
  --media-control-background: rgba(255, 87, 34, 0.7);
  --media-range-track-progress-background: #ff5722;
}
```

### 极简主题

```css
media-controller {
  --media-control-background: transparent;
  --media-button-hover-background: rgba(255, 255, 255, 0.05);
  --media-range-height: 4px;
  --media-range-thumb-size: 10px;
}
```

## 注意事项

1. **变量优先级**：内联样式 > 组件特定变量 > 全局变量
2. **单位**：所有尺寸变量应使用 `px`、`em` 或 `rem` 单位
3. **颜色**：支持所有 CSS 颜色值（十六进制、rgb、rgba、hsl等）
4. **过渡**：使用 CSS 过渡时注意变量变化不会自动触发过渡
5. **浏览器兼容性**：CSS 变量在现代浏览器中广泛支持

## 完整示例

```css
:root {
  /* 全局主题 */
  --media-primary-color: #3b82f6;
  --media-text-color: #ffffff;
}

media-controller {
  /* 控制器样式 */
  --media-control-background: rgba(0, 0, 0, 0.7);
  --media-control-hover-background: rgba(0, 0, 0, 0.9);
}

media-chrome-button {
  /* 按钮样式 */
  --media-button-width: 44px;
  --media-button-height: 44px;
  --media-button-border-radius: 8px;
}

media-time-range {
  /* 进度条样式 */
  --media-time-range-height: 8px;
  --media-time-range-thumb-size: 16px;
  --media-time-range-played-color: var(--media-primary-color);
}

@media (max-width: 768px) {
  media-chrome-button {
    --media-button-width: 36px;
    --media-button-height: 36px;
  }
}
```
