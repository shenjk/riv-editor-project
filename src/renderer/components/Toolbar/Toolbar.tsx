import React from 'react';
import { useEditorStore } from '@store/useEditorStore';

interface Tool {
  id: string;
  name: string;
  icon: string;
  shortcut?: string;
}

const TOOLS: Tool[] = [
  { id: 'select', name: '选择', icon: '↖', shortcut: 'V' },
  { id: 'hand', name: '抓手', icon: '✋', shortcut: 'H' },
  { id: 'rect', name: '矩形', icon: '▭', shortcut: 'R' },
  { id: 'ellipse', name: '椭圆', icon: '○', shortcut: 'E' },
  { id: 'path', name: '路径', icon: '✏', shortcut: 'P' },
  { id: 'text', name: '文本', icon: 'T', shortcut: 'T' },
];

export const Toolbar: React.FC = () => {
  const { currentTool, setCurrentTool, undo, redo, canUndo, canRedo } = useEditorStore();

  const handleToolClick = (toolId: string) => {
    setCurrentTool(toolId);
  };

  return (
    <div className="h-12 bg-gray-900 border-b border-gray-700 flex items-center px-4 gap-2">
      {/* Logo */}
      <div className="text-lg font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent mr-4">
        RIV Editor
      </div>

      <div className="w-px h-6 bg-gray-700" />

      {/* 工具按钮 */}
      <div className="flex gap-1">
        {TOOLS.map((tool) => (
          <button
            key={tool.id}
            onClick={() => handleToolClick(tool.id)}
            className={`
              w-9 h-9 rounded flex items-center justify-center
              transition-all duration-150 text-lg
              ${
                currentTool === tool.id
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }
            `}
            title={`${tool.name} (${tool.shortcut})`}
          >
            {tool.icon}
          </button>
        ))}
      </div>

      <div className="w-px h-6 bg-gray-700" />

      {/* 历史操作 */}
      <div className="flex gap-1">
        <button
          onClick={undo}
          disabled={!canUndo}
          className={`
            w-9 h-9 rounded flex items-center justify-center
            transition-all duration-150
            ${
              canUndo
                ? 'text-gray-400 hover:bg-gray-800 hover:text-white'
                : 'text-gray-600 cursor-not-allowed'
            }
          `}
          title="撤销 (Ctrl+Z)"
        >
          ↶
        </button>
        <button
          onClick={redo}
          disabled={!canRedo}
          className={`
            w-9 h-9 rounded flex items-center justify-center
            transition-all duration-150
            ${
              canRedo
                ? 'text-gray-400 hover:bg-gray-800 hover:text-white'
                : 'text-gray-600 cursor-not-allowed'
            }
          `}
          title="重做 (Ctrl+Y)"
        >
          ↷
        </button>
      </div>

      {/* 右侧操作 */}
      <div className="ml-auto flex gap-2">
        <button
          className="px-3 py-1.5 rounded bg-gray-800 hover:bg-gray-700 text-sm text-gray-300 transition"
          title="导出"
        >
          ⬇ 导出
        </button>
      </div>
    </div>
  );
};
