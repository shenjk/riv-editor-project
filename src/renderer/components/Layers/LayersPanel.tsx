import React from 'react';
import { useEditorStore } from '@store/useEditorStore';

interface LayerItemProps {
  layer: any;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

const LayerItem: React.FC<LayerItemProps> = ({ layer, isSelected, onSelect }) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'rect': return '▭';
      case 'ellipse': return '○';
      case 'path': return '✏';
      case 'text': return 'T';
      default: return '■';
    }
  };

  return (
    <div
      onClick={() => onSelect(layer.id)}
      className={`
        px-3 py-2 flex items-center gap-2 cursor-pointer
        transition-all duration-150 border-l-2
        ${
          isSelected
            ? 'bg-blue-900 bg-opacity-50 border-blue-500'
            : 'border-transparent hover:bg-gray-800'
        }
      `}
    >
      <span className="text-sm opacity-70">{getIcon(layer.type)}</span>
      <span className="flex-1 text-sm truncate">{layer.name || `图层 ${layer.id}`}</span>
      <button
        className="opacity-0 group-hover:opacity-100 hover:text-blue-400 transition"
        title="可见性"
      >
        👁
      </button>
    </div>
  );
};

export const LayersPanel: React.FC = () => {
  const { shapes, selectedShapes, selectShape, deleteShape } = useEditorStore();

  const handleSelect = (id: string) => {
    selectShape(id, false); // false = 不多选
  };

  const handleDelete = () => {
    selectedShapes.forEach(id => deleteShape(id));
  };

  return (
    <div className="w-60 h-full bg-gray-900 border-r border-gray-700 flex flex-col">
      {/* 标题栏 */}
      <div className="h-10 px-3 flex items-center justify-between border-b border-gray-700">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          图层
        </span>
        <button
          onClick={handleDelete}
          disabled={selectedShapes.length === 0}
          className={`
            text-xs px-2 py-1 rounded transition
            ${
              selectedShapes.length > 0
                ? 'hover:bg-red-900 hover:text-red-300'
                : 'opacity-30 cursor-not-allowed'
            }
          `}
          title="删除选中图层"
        >
          🗑
        </button>
      </div>

      {/* 图层列表 */}
      <div className="flex-1 overflow-y-auto">
        {shapes.length === 0 ? (
          <div className="p-4 text-center text-sm text-gray-500">
            暂无图层
            <br />
            <span className="text-xs">使用工具开始创建</span>
          </div>
        ) : (
          <div className="py-1">
            {[...shapes].reverse().map((shape) => (
              <LayerItem
                key={shape.id}
                layer={shape}
                isSelected={selectedShapes.includes(shape.id)}
                onSelect={handleSelect}
              />
            ))}
          </div>
        )}
      </div>

      {/* 底部操作栏 */}
      <div className="h-10 px-3 flex items-center gap-2 border-t border-gray-700">
        <button
          className="flex-1 text-xs py-1 rounded bg-gray-800 hover:bg-gray-700 transition"
          title="添加图层"
        >
          + 新建
        </button>
        <button
          className="flex-1 text-xs py-1 rounded bg-gray-800 hover:bg-gray-700 transition"
          title="分组"
        >
          📁 分组
        </button>
      </div>
    </div>
  );
};
