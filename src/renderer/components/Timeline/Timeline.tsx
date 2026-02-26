import React, { useState } from 'react';
import { useEditorStore } from '@store/useEditorStore';

interface Track {
  id: string;
  name: string;
  keyframes: number[];
}

export const Timeline: React.FC = () => {
  const { isPlaying, setIsPlaying, currentFrame, setCurrentFrame } = useEditorStore();
  const [tracks] = useState<Track[]>([
    { id: '1', name: 'X 位置', keyframes: [0, 30, 60, 90] },
    { id: '2', name: 'Y 位置', keyframes: [0, 60] },
    { id: '3', name: '旋转', keyframes: [0, 40, 80] },
    { id: '4', name: '缩放', keyframes: [0, 30, 90] },
  ]);

  const maxFrame = 120;
  const frameWidth = 5; // 每帧的宽度(像素)

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (frame: number) => {
    setCurrentFrame(Math.max(0, Math.min(frame, maxFrame)));
  };

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - 120; // 减去轨道标签宽度
    const frame = Math.round(x / frameWidth);
    handleSeek(frame);
  };

  return (
    <div className="h-52 bg-gray-900 border-t border-gray-700 flex flex-col">
      {/* 控制栏 */}
      <div className="h-10 px-4 flex items-center gap-3 border-b border-gray-700">
        {/* 播放控制 */}
        <button
          onClick={togglePlayback}
          className="w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center transition"
          title={isPlaying ? '暂停' : '播放'}
        >
          {isPlaying ? (
            <span className="text-white text-sm">⏸</span>
          ) : (
            <span className="text-white text-sm">▶</span>
          )}
        </button>

        {/* 时间显示 */}
        <div className="text-xs font-mono text-gray-400">
          {String(Math.floor(currentFrame / 60)).padStart(2, '0')}:
          {String(currentFrame % 60).padStart(2, '0')}
        </div>

        <div className="w-px h-6 bg-gray-700" />

        {/* 关键帧操作 */}
        <button
          className="px-2 py-1 text-xs rounded bg-gray-800 hover:bg-gray-700 transition"
          title="添加关键帧"
        >
          ◆ 关键帧
        </button>

        <button
          className="px-2 py-1 text-xs rounded bg-gray-800 hover:bg-gray-700 transition"
          title="删除关键帧"
        >
          🗑
        </button>

        {/* 右侧信息 */}
        <div className="ml-auto text-xs text-gray-500">
          总帧数: {maxFrame} | FPS: 60
        </div>
      </div>

      {/* 时间轴内容 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 轨道列表 */}
        <div className="w-30 bg-gray-900 border-r border-gray-700 overflow-y-auto">
          {/* 标尺区域 */}
          <div className="h-8 border-b border-gray-700" />

          {/* 轨道标签 */}
          {tracks.map((track) => (
            <div
              key={track.id}
              className="h-10 px-3 flex items-center text-xs text-gray-400 border-b border-gray-800 hover:bg-gray-800 transition"
            >
              {track.name}
            </div>
          ))}
        </div>

        {/* 时间轴区域 */}
        <div className="flex-1 overflow-x-auto overflow-y-auto">
          <div className="relative" style={{ width: `${maxFrame * frameWidth}px` }}>
            {/* 标尺 */}
            <div className="h-8 bg-gray-800 border-b border-gray-700 relative">
              {Array.from({ length: Math.ceil(maxFrame / 10) + 1 }).map((_, i) => {
                const frame = i * 10;
                return (
                  <div
                    key={i}
                    className="absolute text-xs text-gray-500"
                    style={{ left: `${frame * frameWidth}px`, top: '8px' }}
                  >
                    {frame}
                  </div>
                );
              })}

              {/* 播放头 */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10"
                style={{ left: `${currentFrame * frameWidth}px` }}
              >
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-red-500 rounded-full" />
              </div>
            </div>

            {/* 轨道 */}
            <div onClick={handleTimelineClick}>
              {tracks.map((track) => (
                <div
                  key={track.id}
                  className="h-10 border-b border-gray-800 relative"
                  style={{
                    backgroundImage: `repeating-linear-gradient(
                      to right,
                      transparent 0,
                      transparent ${frameWidth * 5 - 1}px,
                      #2a2a2a ${frameWidth * 5 - 1}px,
                      #2a2a2a ${frameWidth * 5}px
                    )`,
                  }}
                >
                  {/* 关键帧 */}
                  {track.keyframes.map((frame, i) => (
                    <div
                      key={i}
                      className="absolute top-1/2 transform -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-sm cursor-pointer hover:bg-blue-400 transition shadow-lg"
                      style={{ left: `${frame * frameWidth - 4}px` }}
                      title={`关键帧 ${frame}`}
                    />
                  ))}

                  {/* 关键帧之间的连线 */}
                  {track.keyframes.slice(0, -1).map((frame, i) => {
                    const nextFrame = track.keyframes[i + 1];
                    const width = (nextFrame - frame) * frameWidth;
                    return (
                      <div
                        key={`line-${i}`}
                        className="absolute top-1/2 h-0.5 bg-blue-700 opacity-50"
                        style={{
                          left: `${frame * frameWidth}px`,
                          width: `${width}px`,
                        }}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
