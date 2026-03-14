/**
 * Media Chrome React 集成示例
 *
 * 安装依赖：
 * npm install media-chrome
 *
 * 使用方式：
 * import VideoPlayer from './react-player.tsx';
 */

import React, { useRef, useState, useEffect } from 'react';

// 组件类型定义
interface VideoPlayerProps {
  src: string;
  poster?: string;
  width?: number | string;
  height?: number | string;
  autoplay?: boolean;
  muted?: boolean;
  loop?: boolean;
  onTimeUpdate?: (currentTime: number) => void;
  onPlay?: () => void;
  onPause?: () => void;
}

// 方式一：使用官方 React 包装器
import {
  MediaController,
  MediaPlayButton,
  MediaMuteButton,
  MediaVolumeRange,
  MediaTimeDisplay,
  MediaTimeRange,
  MediaDurationDisplay,
  MediaFullscreenButton,
  MediaPosterImage,
  MediaLoadingIndicator,
} from 'media-chrome/react';

function ReactPlayerWithWrappers({
  src,
  poster,
  width = '100%',
  height = 'auto',
  autoplay = false,
  muted = false,
  loop = false,
  onTimeUpdate,
  onPlay,
  onPause,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleTimeUpdate = () => {
    if (videoRef.current && onTimeUpdate) {
      onTimeUpdate(videoRef.current.currentTime);
    }
  };

  const handlePlay = () => {
    if (onPlay) onPlay();
  };

  const handlePause = () => {
    if (onPause) onPause();
  };

  return (
    <div style={{ width, position: 'relative' }}>
      <MediaController>
        <video
          ref={videoRef}
          slot="media"
          src={src}
          playsinline
          crossOrigin="anonymous"
          autoPlay={autoplay}
          muted={muted}
          loop={loop}
          onTimeUpdate={handleTimeUpdate}
          onPlay={handlePlay}
          onPause={handlePause}
          style={{ width: '100%', height: '100%' }}
        />
        {poster && <MediaPosterImage slot="poster" src={poster} />}
        <MediaLoadingIndicator slot="centered-chrome" noautohide />
        <MediaController.MediaControlBar>
          <MediaPlayButton />
          <MediaMuteButton />
          <MediaVolumeRange />
          <MediaTimeDisplay />
          <MediaTimeRange />
          <MediaDurationDisplay />
          <MediaFullscreenButton />
        </MediaController.MediaControlBar>
      </MediaController>
    </div>
  );
}

// 方式二：直接使用 Web Components
function ReactPlayerWithWebComponents({
  src,
  poster,
  width = '100%',
  height = 'auto',
  autoplay = false,
  muted = false,
  loop = false,
  onTimeUpdate,
  onPlay,
  onPause,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // 动态加载 Media Chrome
    import('media-chrome').then(() => {
      setIsLoaded(true);
    });
  }, []);

  const handleTimeUpdate = () => {
    if (videoRef.current && onTimeUpdate) {
      onTimeUpdate(videoRef.current.currentTime);
    }
  };

  const handlePlay = () => {
    if (onPlay) onPlay();
  };

  const handlePause = () => {
    if (onPause) onPause();
  };

  if (!isLoaded) {
    return <div style={{ width, height, background: '#000' }} />;
  }

  return (
    <div style={{ width, position: 'relative' }}>
      <media-controller>
        <video
          ref={videoRef}
          slot="media"
          src={src}
          playsinline
          crossOrigin="anonymous"
          autoPlay={autoplay}
          muted={muted}
          loop={loop}
          onTimeUpdate={handleTimeUpdate}
          onPlay={handlePlay}
          onPause={handlePause}
          style={{ width: '100%', height: '100%' }}
        />
        {poster && <media-poster-image slot="poster" src={poster} />}
        <media-loading-indicator slot="centered-chrome" noautohide />
        <media-control-bar>
          <media-play-button />
          <media-mute-button />
          <media-volume-range />
          <media-time-display />
          <media-time-range />
          <media-duration-display />
          <media-fullscreen-button />
        </media-control-bar>
      </media-controller>
    </div>
  );
}

// 方式三：带字幕和播放速度的高级播放器
function AdvancedReactPlayer({
  src,
  poster,
  tracks,
}: {
  src: string;
  poster?: string;
  tracks?: Array<{
    kind: string;
    label: string;
    src: string;
    srclang: string;
    default?: boolean;
  }>;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    import('media-chrome').then(() => {
      setIsLoaded(true);
    });
  }, []);

  if (!isLoaded) {
    return <div style={{ width: '100%', aspectRatio: '16 / 9', background: '#000' }} />;
  }

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto' }}>
      <media-controller
        style={{
          '--media-primary-color': '#3b82f6',
          '--media-control-background': 'rgba(0, 0, 0, 0.7)',
        } as React.CSSProperties}
      >
        <video
          ref={videoRef}
          slot="media"
          src={src}
          playsinline
          crossOrigin="anonymous"
          style={{ width: '100%' }}
        >
          {tracks?.map((track, index) => (
            <track
              key={index}
              kind={track.kind}
              label={track.label}
              src={track.src}
              srcLang={track.srclang}
              default={track.default}
            />
          ))}
        </video>
        {poster && <media-poster-image slot="poster" src={poster} />}
        <media-loading-indicator slot="centered-chrome" noautohide />
        <media-control-bar>
          <media-play-button />
          <media-seek-backward-button seekoffset="10" />
          <media-seek-forward-button seekoffset="10" />
          <media-mute-button />
          <media-volume-range />
          <media-time-display />
          <media-time-range />
          <media-duration-display />
          <media-captions-button />
          <media-playback-rate-button />
          <media-pip-button />
          <media-fullscreen-button />
        </media-control-bar>
      </media-controller>
    </div>
  );
}

// 导出组件
export default ReactPlayerWithWrappers;
export { ReactPlayerWithWrappers, ReactPlayerWithWebComponents, AdvancedReactPlayer };

// 使用示例
/*
import ReactPlayer, { AdvancedReactPlayer } from './react-player.tsx';

function App() {
  return (
    <div>
      <h2>基础播放器</h2>
      <ReactPlayer
        src="https://example.com/video.mp4"
        poster="https://example.com/poster.jpg"
        onTimeUpdate={(time) => console.log('当前时间:', time)}
      />

      <h2>高级播放器（带字幕）</h2>
      <AdvancedReactPlayer
        src="https://example.com/video.mp4"
        poster="https://example.com/poster.jpg"
        tracks={[
          {
            kind: 'captions',
            label: '中文',
            src: 'https://example.com/zh.vtt',
            srclang: 'zh',
            default: true,
          },
          {
            kind: 'captions',
            label: 'English',
            src: 'https://example.com/en.vtt',
            srclang: 'en',
          },
        ]}
      />
    </div>
  );
}
*/
