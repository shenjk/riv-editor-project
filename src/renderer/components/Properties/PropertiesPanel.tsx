import React from 'react';
import { useEditorStore } from '@store/useEditorStore';

export const PropertiesPanel: React.FC = () => {
  const { shapes, selectedShapes, updateShape } = useEditorStore();

  const selectedShape = selectedShapes.length === 1 
    ? shapes.find(s => s.id === selectedShapes[0])
    : null;

  const handlePropertyChange = (property: string, value: any) => {
    if (!selectedShape) return;
    updateShape(selectedShape.id, { [property]: value });
  };

  if (!selectedShape) {
    return (
      <div className="w-72 h-full bg-gray-900 border-l border-gray-700 flex items-center justify-center">
        <div className="text-center text-sm text-gray-500">
          <div className="text-4xl mb-2">🎨</div>
          未选择图层
          <br />
          <span className="text-xs">点击图层查看属性</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-72 h-full bg-gray-900 border-l border-gray-700 overflow-y-auto">
      {/* 标题 */}
      <div className="px-4 py-3 border-b border-gray-700">
        <h3 className="text-sm font-semibold text-gray-300">
          {selectedShape.name || '图层属性'}
        </h3>
        <p className="text-xs text-gray-500 mt-1">
          类型: {selectedShape.type}
        </p>
      </div>

      {/* 变换属性 */}
      <div className="p-4 border-b border-gray-700">
        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
          变换
        </h4>

        <div className="space-y-3">
          {/* 位置 */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">X</label>
              <input
                type="number"
                value={Math.round(selectedShape.x || 0)}
                onChange={(e) => handlePropertyChange('x', parseFloat(e.target.value))}
                className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm text-gray-300 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Y</label>
              <input
                type="number"
                value={Math.round(selectedShape.y || 0)}
                onChange={(e) => handlePropertyChange('y', parseFloat(e.target.value))}
                className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm text-gray-300 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* 尺寸 */}
          {selectedShape.type === 'rect' && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">宽度</label>
                <input
                  type="number"
                  value={Math.round(selectedShape.width || 0)}
                  onChange={(e) => handlePropertyChange('width', parseFloat(e.target.value))}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm text-gray-300 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">高度</label>
                <input
                  type="number"
                  value={Math.round(selectedShape.height || 0)}
                  onChange={(e) => handlePropertyChange('height', parseFloat(e.target.value))}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm text-gray-300 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          )}

          {selectedShape.type === 'ellipse' && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">半径 X</label>
                <input
                  type="number"
                  value={Math.round(selectedShape.radiusX || 0)}
                  onChange={(e) => handlePropertyChange('radiusX', parseFloat(e.target.value))}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm text-gray-300 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">半径 Y</label>
                <input
                  type="number"
                  value={Math.round(selectedShape.radiusY || 0)}
                  onChange={(e) => handlePropertyChange('radiusY', parseFloat(e.target.value))}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm text-gray-300 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          )}

          {/* 旋转 */}
          <div>
            <label className="text-xs text-gray-500 mb-1 block">旋转 (度)</label>
            <input
              type="number"
              value={Math.round((selectedShape.rotation || 0) * 180 / Math.PI)}
              onChange={(e) => handlePropertyChange('rotation', parseFloat(e.target.value) * Math.PI / 180)}
              className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm text-gray-300 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* 外观属性 */}
      <div className="p-4 border-b border-gray-700">
        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
          外观
        </h4>

        <div className="space-y-3">
          {/* 填充颜色 */}
          <div>
            <label className="text-xs text-gray-500 mb-2 block">填充</label>
            <div className="flex gap-2">
              {['#4a9eff', '#ff6b9d', '#7b61ff', '#ffd93d', '#6bcf7f'].map((color) => (
                <button
                  key={color}
                  onClick={() => handlePropertyChange('fill', color)}
                  className={`
                    w-8 h-8 rounded border-2 transition
                    ${selectedShape.fill === color ? 'border-white scale-110' : 'border-gray-700'}
                  `}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>

          {/* 不透明度 */}
          <div>
            <label className="text-xs text-gray-500 mb-1 block">不透明度</label>
            <input
              type="range"
              min="0"
              max="100"
              value={(selectedShape.opacity || 1) * 100}
              onChange={(e) => handlePropertyChange('opacity', parseFloat(e.target.value) / 100)}
              className="w-full"
            />
            <div className="text-xs text-gray-500 text-right mt-1">
              {Math.round((selectedShape.opacity || 1) * 100)}%
            </div>
          </div>
        </div>
      </div>

      {/* 描边属性 */}
      <div className="p-4">
        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
          描边
        </h4>

        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">宽度</label>
            <input
              type="number"
              min="0"
              max="20"
              value={selectedShape.stroke?.width || 0}
              onChange={(e) => handlePropertyChange('stroke', {
                ...selectedShape.stroke,
                width: parseFloat(e.target.value)
              })}
              className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm text-gray-300 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
