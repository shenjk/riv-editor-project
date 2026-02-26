import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

interface Shape {
  id: string;
  type: 'rect' | 'ellipse' | 'path' | 'text';
  x: number;
  y: number;
  width?: number;
  height?: number;
  radiusX?: number;
  radiusY?: number;
  rotation: number;
  fill: string;
  stroke?: {
    color: string;
    width: number;
  };
  opacity?: number;
  name?: string;
  pathData?: string;
}

interface HistoryState {
  shapes: Shape[];
  selectedShapes: string[];
}

interface EditorState {
  // 工具
  currentTool: string;
  setCurrentTool: (tool: string) => void;

  // 图形
  shapes: Shape[];
  addShape: (shape: Shape) => void;
  updateShape: (id: string, updates: Partial<Shape>) => void;
  deleteShape: (id: string) => void;

  // 选择
  selectedShapes: string[];
  selectShape: (id: string, multiSelect?: boolean) => void;
  clearSelection: () => void;

  // 视图
  zoom: number;
  setZoom: (zoom: number) => void;
  pan: { x: number; y: number };
  setPan: (pan: { x: number; y: number }) => void;

  // 时间轴
  currentFrame: number;
  setCurrentFrame: (frame: number) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;

  // 历史记录
  history: HistoryState[];
  historyIndex: number;
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
  pushHistory: () => void;
}

export const useEditorStore = create<EditorState>()(
  immer((set, get) => ({
    // 初始状态
    currentTool: 'select',
    shapes: [],
    selectedShapes: [],
    zoom: 1,
    pan: { x: 0, y: 0 },
    currentFrame: 0,
    isPlaying: false,
    history: [],
    historyIndex: -1,
    canUndo: false,
    canRedo: false,

    // 工具操作
    setCurrentTool: (tool) => {
      set((state) => {
        state.currentTool = tool;
      });
    },

    // 图形操作
    addShape: (shape) => {
      set((state) => {
        state.shapes.push(shape);
        state.selectedShapes = [shape.id];
      });
      get().pushHistory();
    },

    updateShape: (id, updates) => {
      set((state) => {
        const shape = state.shapes.find((s) => s.id === id);
        if (shape) {
          Object.assign(shape, updates);
        }
      });
      get().pushHistory();
    },

    deleteShape: (id) => {
      set((state) => {
        state.shapes = state.shapes.filter((s) => s.id !== id);
        state.selectedShapes = state.selectedShapes.filter((sid) => sid !== id);
      });
      get().pushHistory();
    },

    // 选择操作
    selectShape: (id, multiSelect = false) => {
      set((state) => {
        if (multiSelect) {
          if (state.selectedShapes.includes(id)) {
            state.selectedShapes = state.selectedShapes.filter((sid) => sid !== id);
          } else {
            state.selectedShapes.push(id);
          }
        } else {
          state.selectedShapes = [id];
        }
      });
    },

    clearSelection: () => {
      set((state) => {
        state.selectedShapes = [];
      });
    },

    // 视图操作
    setZoom: (zoom) => {
      set((state) => {
        state.zoom = Math.max(0.1, Math.min(10, zoom));
      });
    },

    setPan: (pan) => {
      set((state) => {
        state.pan = pan;
      });
    },

    // 时间轴操作
    setCurrentFrame: (frame) => {
      set((state) => {
        state.currentFrame = frame;
      });
    },

    setIsPlaying: (playing) => {
      set((state) => {
        state.isPlaying = playing;
      });

      // 播放动画
      if (playing) {
        const animate = () => {
          const state = get();
          if (!state.isPlaying) return;

          const nextFrame = (state.currentFrame + 1) % 120;
          state.setCurrentFrame(nextFrame);

          requestAnimationFrame(animate);
        };
        animate();
      }
    },

    // 历史记录
    pushHistory: () => {
      set((state) => {
        const currentState: HistoryState = {
          shapes: JSON.parse(JSON.stringify(state.shapes)),
          selectedShapes: [...state.selectedShapes],
        };

        // 删除当前索引之后的历史
        state.history = state.history.slice(0, state.historyIndex + 1);

        // 添加新历史
        state.history.push(currentState);
        state.historyIndex = state.history.length - 1;

        // 限制历史记录数量
        if (state.history.length > 50) {
          state.history.shift();
          state.historyIndex--;
        }

        state.canUndo = state.historyIndex > 0;
        state.canRedo = state.historyIndex < state.history.length - 1;
      });
    },

    undo: () => {
      set((state) => {
        if (state.historyIndex <= 0) return;

        state.historyIndex--;
        const prevState = state.history[state.historyIndex];
        
        state.shapes = JSON.parse(JSON.stringify(prevState.shapes));
        state.selectedShapes = [...prevState.selectedShapes];

        state.canUndo = state.historyIndex > 0;
        state.canRedo = true;
      });
    },

    redo: () => {
      set((state) => {
        if (state.historyIndex >= state.history.length - 1) return;

        state.historyIndex++;
        const nextState = state.history[state.historyIndex];
        
        state.shapes = JSON.parse(JSON.stringify(nextState.shapes));
        state.selectedShapes = [...nextState.selectedShapes];

        state.canUndo = true;
        state.canRedo = state.historyIndex < state.history.length - 1;
      });
    },
  }))
);
