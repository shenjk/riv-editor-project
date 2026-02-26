// ============================================
// RIV Editor - TypeScript 类型定义
// ============================================

export interface Vector2 {
  x: number;
  y: number;
}

export interface Transform {
  position: Vector2;
  scale: Vector2;
  rotation: number;
  pivot?: Vector2;
}

export interface Color {
  r: number;
  g: number;
  b: number;
  a: number;
}

export interface Gradient {
  type: 'linear' | 'radial';
  stops: Array<{ offset: number; color: Color }>;
  start?: Vector2;
  end?: Vector2;
  center?: Vector2;
  radius?: number;
}

export interface Fill {
  type: 'solid' | 'gradient' | 'none';
  color?: Color;
  gradient?: Gradient;
}

export interface Stroke {
  color: Color;
  width: number;
  cap?: 'butt' | 'round' | 'square';
  join?: 'miter' | 'round' | 'bevel';
  dashArray?: number[];
}

export type ShapeType = 'rect' | 'ellipse' | 'path' | 'text' | 'group';

export interface BaseShape {
  id: string;
  name: string;
  type: ShapeType;
  x: number;
  y: number;
  rotation: number;
  opacity: number;
  visible: boolean;
  locked: boolean;
  fill?: string | Fill;
  stroke?: Stroke;
}

export interface RectShape extends BaseShape {
  type: 'rect';
  width: number;
  height: number;
  cornerRadius?: number;
}

export interface EllipseShape extends BaseShape {
  type: 'ellipse';
  radiusX: number;
  radiusY: number;
}

export interface PathShape extends BaseShape {
  type: 'path';
  pathData: string;
}

export interface TextShape extends BaseShape {
  type: 'text';
  content: string;
  fontSize: number;
  fontFamily: string;
  fontWeight?: number;
}

export interface GroupShape extends BaseShape {
  type: 'group';
  children: Shape[];
}

export type Shape = RectShape | EllipseShape | PathShape | TextShape | GroupShape;

// 动画相关
export type EasingFunction =
  | 'linear'
  | 'ease-in'
  | 'ease-out'
  | 'ease-in-out'
  | 'bounce'
  | 'elastic'
  | { bezier: [number, number, number, number] };

export interface Keyframe<T = any> {
  time: number;
  value: T;
  easing: EasingFunction;
}

export interface AnimationTrack {
  property: string;
  keyframes: Keyframe[];
}

export interface Animation {
  id: string;
  name: string;
  duration: number;
  tracks: AnimationTrack[];
  loop: 'once' | 'loop' | 'pingpong';
}

// 状态机相关
export interface StateMachineState {
  id: string;
  name: string;
  animationId?: string;
  position: Vector2;
}

export interface Condition {
  type: 'boolean' | 'number' | 'string';
  parameter: string;
  operator: '==' | '!=' | '>' | '<' | '>=' | '<=';
  value: any;
}

export interface Trigger {
  type: 'click' | 'hover' | 'press' | 'release' | 'keydown' | 'keyup' | 'custom';
  targetId?: string;
  key?: string;
  eventName?: string;
}

export interface StateTransition {
  from: string;
  to: string;
  conditions: Condition[];
  triggers: Trigger[];
  duration?: number;
}

export interface StateMachine {
  id: string;
  name: string;
  states: StateMachineState[];
  transitions: StateTransition[];
  parameters: Record<string, any>;
  currentState: string;
  entryState: string;
}

// 项目相关
export interface Artboard {
  id: string;
  name: string;
  width: number;
  height: number;
  backgroundColor: Color;
  shapes: Shape[];
}

export interface Asset {
  id: string;
  name: string;
  type: 'image' | 'font';
  data: ArrayBuffer;
}

export interface Project {
  version: string;
  name: string;
  artboards: Artboard[];
  animations: Animation[];
  stateMachines: StateMachine[];
  assets: Asset[];
}

// 编辑器状态
export interface EditorState {
  currentTool: string;
  shapes: Shape[];
  selectedShapes: string[];
  zoom: number;
  pan: Vector2;
  currentFrame: number;
  isPlaying: boolean;
}

// 导出选项
export interface ExportOptions {
  format: 'riv' | 'png' | 'gif' | 'svg';
  quality?: number;
  fps?: number;
  includeDebugInfo?: boolean;
  compressionLevel?: number;
}
