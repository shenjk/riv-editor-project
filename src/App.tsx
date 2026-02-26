import React from 'react';
import { Toolbar } from './renderer/components/Toolbar/Toolbar';
import { Canvas } from './renderer/components/Canvas/Canvas';
import { LayersPanel } from './renderer/components/Layers/LayersPanel';
import { PropertiesPanel } from './renderer/components/Properties/PropertiesPanel';
import { Timeline } from './renderer/components/Timeline/Timeline';

function App() {
  return (
    <div className="h-screen bg-gray-900 text-gray-100 flex flex-col overflow-hidden">
      {/* 顶部工具栏 */}
      <Toolbar />

      {/* 主工作区 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 左侧图层面板 */}
        <LayersPanel />

        {/* 中间画布区域 */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1">
            <Canvas />
          </div>

          {/* 底部时间轴 */}
          <Timeline />
        </div>

        {/* 右侧属性面板 */}
        <PropertiesPanel />
      </div>
    </div>
  );
}

export default App;
