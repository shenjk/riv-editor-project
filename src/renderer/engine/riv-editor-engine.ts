// ============================================
// RIV Editor - Core Engine
// 核心引擎模块: 图形、动画、状态机、导出
// ============================================

// ========== 类型定义 ==========

export interface Vector2 {
  x: number;
  y: number;
}

export interface Transform {
  position: Vector2;
  scale: Vector2;
  rotation: number; // 弧度
  pivot: Vector2;
}

export interface Color {
  r: number; // 0-255
  g: number;
  b: number;
  a: number; // 0-1
}

export interface Gradient {
  type: 'linear' | 'radial';
  stops: Array<{ offset: number; color: Color }>;
  start?: Vector2; // 线性渐变
  end?: Vector2;
  center?: Vector2; // 径向渐变
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
  cap: 'butt' | 'round' | 'square';
  join: 'miter' | 'round' | 'bevel';
  dashArray?: number[];
}

// ========== 图形对象 ==========

export abstract class Shape {
  id: string;
  name: string;
  transform: Transform;
  fill: Fill;
  stroke: Stroke | null;
  opacity: number;
  visible: boolean;
  locked: boolean;
  parent: Group | null = null;

  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
    this.transform = {
      position: { x: 0, y: 0 },
      scale: { x: 1, y: 1 },
      rotation: 0,
      pivot: { x: 0, y: 0 }
    };
    this.fill = { type: 'solid', color: { r: 128, g: 128, b: 128, a: 1 } };
    this.stroke = null;
    this.opacity = 1;
    this.visible = true;
    this.locked = false;
  }

  abstract render(ctx: CanvasRenderingContext2D): void;
  abstract getBounds(): { x: number; y: number; width: number; height: number };
  abstract clone(): Shape;
}

export class Rectangle extends Shape {
  width: number;
  height: number;
  cornerRadius: number;

  constructor(id: string, name: string, width = 100, height = 100) {
    super(id, name);
    this.width = width;
    this.height = height;
    this.cornerRadius = 0;
  }

  render(ctx: CanvasRenderingContext2D): void {
    if (!this.visible) return;

    ctx.save();
    ctx.translate(this.transform.position.x, this.transform.position.y);
    ctx.rotate(this.transform.rotation);
    ctx.scale(this.transform.scale.x, this.transform.scale.y);
    ctx.globalAlpha = this.opacity;

    const x = -this.width * this.transform.pivot.x;
    const y = -this.height * this.transform.pivot.y;

    // 绘制圆角矩形
    if (this.cornerRadius > 0) {
      const r = Math.min(this.cornerRadius, this.width / 2, this.height / 2);
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + this.width - r, y);
      ctx.arcTo(x + this.width, y, x + this.width, y + r, r);
      ctx.lineTo(x + this.width, y + this.height - r);
      ctx.arcTo(x + this.width, y + this.height, x + this.width - r, y + this.height, r);
      ctx.lineTo(x + r, y + this.height);
      ctx.arcTo(x, y + this.height, x, y + this.height - r, r);
      ctx.lineTo(x, y + r);
      ctx.arcTo(x, y, x + r, y, r);
      ctx.closePath();
    } else {
      ctx.beginPath();
      ctx.rect(x, y, this.width, this.height);
    }

    this.applyFill(ctx);
    this.applyStroke(ctx);

    ctx.restore();
  }

  private applyFill(ctx: CanvasRenderingContext2D): void {
    if (this.fill.type === 'solid' && this.fill.color) {
      const c = this.fill.color;
      ctx.fillStyle = `rgba(${c.r}, ${c.g}, ${c.b}, ${c.a})`;
      ctx.fill();
    } else if (this.fill.type === 'gradient' && this.fill.gradient) {
      // 实现渐变填充
      const grad = this.fill.gradient;
      let gradient: CanvasGradient;
      
      if (grad.type === 'linear' && grad.start && grad.end) {
        gradient = ctx.createLinearGradient(
          grad.start.x, grad.start.y, grad.end.x, grad.end.y
        );
      } else if (grad.type === 'radial' && grad.center && grad.radius) {
        gradient = ctx.createRadialGradient(
          grad.center.x, grad.center.y, 0,
          grad.center.x, grad.center.y, grad.radius
        );
      } else {
        return;
      }

      grad.stops.forEach(stop => {
        const c = stop.color;
        gradient.addColorStop(stop.offset, `rgba(${c.r}, ${c.g}, ${c.b}, ${c.a})`);
      });

      ctx.fillStyle = gradient;
      ctx.fill();
    }
  }

  private applyStroke(ctx: CanvasRenderingContext2D): void {
    if (!this.stroke) return;

    const c = this.stroke.color;
    ctx.strokeStyle = `rgba(${c.r}, ${c.g}, ${c.b}, ${c.a})`;
    ctx.lineWidth = this.stroke.width;
    ctx.lineCap = this.stroke.cap;
    ctx.lineJoin = this.stroke.join;
    
    if (this.stroke.dashArray) {
      ctx.setLineDash(this.stroke.dashArray);
    }

    ctx.stroke();
  }

  getBounds() {
    return {
      x: this.transform.position.x - this.width * this.transform.pivot.x,
      y: this.transform.position.y - this.height * this.transform.pivot.y,
      width: this.width,
      height: this.height
    };
  }

  clone(): Rectangle {
    const cloned = new Rectangle(this.id + '_clone', this.name + ' 副本', this.width, this.height);
    cloned.transform = { ...this.transform };
    cloned.fill = { ...this.fill };
    cloned.stroke = this.stroke ? { ...this.stroke } : null;
    cloned.opacity = this.opacity;
    cloned.cornerRadius = this.cornerRadius;
    return cloned;
  }
}

export class Ellipse extends Shape {
  radiusX: number;
  radiusY: number;

  constructor(id: string, name: string, radiusX = 50, radiusY = 50) {
    super(id, name);
    this.radiusX = radiusX;
    this.radiusY = radiusY;
  }

  render(ctx: CanvasRenderingContext2D): void {
    if (!this.visible) return;

    ctx.save();
    ctx.translate(this.transform.position.x, this.transform.position.y);
    ctx.rotate(this.transform.rotation);
    ctx.scale(this.transform.scale.x, this.transform.scale.y);
    ctx.globalAlpha = this.opacity;

    ctx.beginPath();
    ctx.ellipse(0, 0, this.radiusX, this.radiusY, 0, 0, Math.PI * 2);

    if (this.fill.type === 'solid' && this.fill.color) {
      const c = this.fill.color;
      ctx.fillStyle = `rgba(${c.r}, ${c.g}, ${c.b}, ${c.a})`;
      ctx.fill();
    }

    if (this.stroke) {
      const c = this.stroke.color;
      ctx.strokeStyle = `rgba(${c.r}, ${c.g}, ${c.b}, ${c.a})`;
      ctx.lineWidth = this.stroke.width;
      ctx.stroke();
    }

    ctx.restore();
  }

  getBounds() {
    return {
      x: this.transform.position.x - this.radiusX,
      y: this.transform.position.y - this.radiusY,
      width: this.radiusX * 2,
      height: this.radiusY * 2
    };
  }

  clone(): Ellipse {
    const cloned = new Ellipse(this.id + '_clone', this.name + ' 副本', this.radiusX, this.radiusY);
    cloned.transform = { ...this.transform };
    cloned.fill = { ...this.fill };
    cloned.stroke = this.stroke ? { ...this.stroke } : null;
    cloned.opacity = this.opacity;
    return cloned;
  }
}

export class Path extends Shape {
  pathData: string; // SVG路径数据

  constructor(id: string, name: string, pathData = '') {
    super(id, name);
    this.pathData = pathData;
  }

  render(ctx: CanvasRenderingContext2D): void {
    if (!this.visible || !this.pathData) return;

    ctx.save();
    ctx.translate(this.transform.position.x, this.transform.position.y);
    ctx.rotate(this.transform.rotation);
    ctx.scale(this.transform.scale.x, this.transform.scale.y);
    ctx.globalAlpha = this.opacity;

    const path = new Path2D(this.pathData);

    if (this.fill.type === 'solid' && this.fill.color) {
      const c = this.fill.color;
      ctx.fillStyle = `rgba(${c.r}, ${c.g}, ${c.b}, ${c.a})`;
      ctx.fill(path);
    }

    if (this.stroke) {
      const c = this.stroke.color;
      ctx.strokeStyle = `rgba(${c.r}, ${c.g}, ${c.b}, ${c.a})`;
      ctx.lineWidth = this.stroke.width;
      ctx.stroke(path);
    }

    ctx.restore();
  }

  getBounds() {
    // 简化实现,实际需要解析路径数据
    return {
      x: this.transform.position.x,
      y: this.transform.position.y,
      width: 100,
      height: 100
    };
  }

  clone(): Path {
    const cloned = new Path(this.id + '_clone', this.name + ' 副本', this.pathData);
    cloned.transform = { ...this.transform };
    cloned.fill = { ...this.fill };
    cloned.stroke = this.stroke ? { ...this.stroke } : null;
    cloned.opacity = this.opacity;
    return cloned;
  }
}

export class Group extends Shape {
  children: Shape[] = [];

  constructor(id: string, name: string) {
    super(id, name);
  }

  addChild(shape: Shape): void {
    shape.parent = this;
    this.children.push(shape);
  }

  removeChild(shape: Shape): void {
    const index = this.children.indexOf(shape);
    if (index > -1) {
      this.children[index].parent = null;
      this.children.splice(index, 1);
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    if (!this.visible) return;

    ctx.save();
    ctx.translate(this.transform.position.x, this.transform.position.y);
    ctx.rotate(this.transform.rotation);
    ctx.scale(this.transform.scale.x, this.transform.scale.y);
    ctx.globalAlpha *= this.opacity;

    this.children.forEach(child => child.render(ctx));

    ctx.restore();
  }

  getBounds() {
    if (this.children.length === 0) {
      return { x: 0, y: 0, width: 0, height: 0 };
    }

    let minX = Infinity, minY = Infinity;
    let maxX = -Infinity, maxY = -Infinity;

    this.children.forEach(child => {
      const bounds = child.getBounds();
      minX = Math.min(minX, bounds.x);
      minY = Math.min(minY, bounds.y);
      maxX = Math.max(maxX, bounds.x + bounds.width);
      maxY = Math.max(maxY, bounds.y + bounds.height);
    });

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY
    };
  }

  clone(): Group {
    const cloned = new Group(this.id + '_clone', this.name + ' 副本');
    cloned.transform = { ...this.transform };
    cloned.opacity = this.opacity;
    this.children.forEach(child => {
      cloned.addChild(child.clone());
    });
    return cloned;
  }
}

// ========== 动画系统 ==========

export type EasingFunction = 
  | 'linear'
  | 'ease-in'
  | 'ease-out'
  | 'ease-in-out'
  | 'bounce'
  | 'elastic'
  | { bezier: [number, number, number, number] };

export interface Keyframe<T = any> {
  time: number; // 毫秒
  value: T;
  easing: EasingFunction;
}

export class AnimationTrack<T = any> {
  property: string; // 例如: 'transform.position.x', 'fill.color.r'
  keyframes: Keyframe<T>[];

  constructor(property: string) {
    this.property = property;
    this.keyframes = [];
  }

  addKeyframe(time: number, value: T, easing: EasingFunction = 'linear'): void {
    const keyframe: Keyframe<T> = { time, value, easing };
    
    // 保持按时间排序
    const index = this.keyframes.findIndex(kf => kf.time > time);
    if (index === -1) {
      this.keyframes.push(keyframe);
    } else {
      this.keyframes.splice(index, 0, keyframe);
    }
  }

  removeKeyframe(time: number): void {
    const index = this.keyframes.findIndex(kf => kf.time === time);
    if (index > -1) {
      this.keyframes.splice(index, 1);
    }
  }

  getValueAtTime(time: number): T | null {
    if (this.keyframes.length === 0) return null;

    // 找到当前时间前后的关键帧
    let beforeIndex = -1;
    let afterIndex = -1;

    for (let i = 0; i < this.keyframes.length; i++) {
      if (this.keyframes[i].time <= time) {
        beforeIndex = i;
      }
      if (this.keyframes[i].time >= time && afterIndex === -1) {
        afterIndex = i;
        break;
      }
    }

    // 时间在第一个关键帧之前
    if (beforeIndex === -1) {
      return this.keyframes[0].value;
    }

    // 时间在最后一个关键帧之后
    if (afterIndex === -1) {
      return this.keyframes[this.keyframes.length - 1].value;
    }

    // 正好在关键帧上
    if (beforeIndex === afterIndex) {
      return this.keyframes[beforeIndex].value;
    }

    // 插值计算
    const before = this.keyframes[beforeIndex];
    const after = this.keyframes[afterIndex];
    const progress = (time - before.time) / (after.time - before.time);
    const easedProgress = this.applyEasing(progress, before.easing);

    return this.interpolate(before.value, after.value, easedProgress);
  }

  private applyEasing(t: number, easing: EasingFunction): number {
    if (easing === 'linear') return t;
    if (easing === 'ease-in') return t * t;
    if (easing === 'ease-out') return t * (2 - t);
    if (easing === 'ease-in-out') return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    if (easing === 'bounce') {
      if (t < 1 / 2.75) return 7.5625 * t * t;
      if (t < 2 / 2.75) return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
      if (t < 2.5 / 2.75) return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
      return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
    }
    if (easing === 'elastic') {
      return Math.pow(2, -10 * t) * Math.sin((t - 0.075) * (2 * Math.PI) / 0.3) + 1;
    }
    // 自定义贝塞尔曲线(简化实现)
    if (typeof easing === 'object' && 'bezier' in easing) {
      return t; // 实际需要实现三次贝塞尔曲线
    }
    return t;
  }

  private interpolate(from: T, to: T, progress: number): T {
    if (typeof from === 'number' && typeof to === 'number') {
      return (from + (to - from) * progress) as T;
    }
    
    // 对象插值(例如颜色、向量)
    if (typeof from === 'object' && typeof to === 'object') {
      const result: any = {};
      for (const key in from) {
        if (typeof from[key] === 'number' && typeof to[key] === 'number') {
          result[key] = from[key] + (to[key] - from[key]) * progress;
        }
      }
      return result as T;
    }

    return progress < 0.5 ? from : to;
  }
}

export class Animation {
  id: string;
  name: string;
  duration: number; // 毫秒
  tracks: Map<string, AnimationTrack>; // property -> track
  loop: 'once' | 'loop' | 'pingpong';

  constructor(id: string, name: string, duration = 1000) {
    this.id = id;
    this.name = name;
    this.duration = duration;
    this.tracks = new Map();
    this.loop = 'loop';
  }

  addTrack(property: string): AnimationTrack {
    const track = new AnimationTrack(property);
    this.tracks.set(property, track);
    return track;
  }

  getTrack(property: string): AnimationTrack | undefined {
    return this.tracks.get(property);
  }

  applyToShape(shape: Shape, time: number): void {
    this.tracks.forEach((track, property) => {
      const value = track.getValueAtTime(time);
      if (value !== null) {
        this.setPropertyValue(shape, property, value);
      }
    });
  }

  private setPropertyValue(obj: any, path: string, value: any): void {
    const parts = path.split('.');
    let current = obj;

    for (let i = 0; i < parts.length - 1; i++) {
      if (!current[parts[i]]) {
        current[parts[i]] = {};
      }
      current = current[parts[i]];
    }

    current[parts[parts.length - 1]] = value;
  }
}

// ========== 状态机 ==========

export interface StateMachineState {
  id: string;
  name: string;
  animationId?: string;
  position: Vector2; // 编辑器中的节点位置
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
  duration?: number; // 过渡持续时间
}

export class StateMachine {
  id: string;
  name: string;
  states: Map<string, StateMachineState>;
  transitions: StateTransition[];
  parameters: Map<string, any>;
  currentState: string;
  entryState: string;

  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
    this.states = new Map();
    this.transitions = [];
    this.parameters = new Map();
    this.currentState = 'entry';
    this.entryState = 'entry';
  }

  addState(id: string, name: string, animationId?: string): void {
    this.states.set(id, {
      id,
      name,
      animationId,
      position: { x: 0, y: 0 }
    });
  }

  addTransition(from: string, to: string, triggers: Trigger[] = [], conditions: Condition[] = []): void {
    this.transitions.push({ from, to, triggers, conditions });
  }

  setParameter(name: string, value: any): void {
    this.parameters.set(name, value);
  }

  checkTransitions(event?: { type: string; target?: string; key?: string }): string | null {
    for (const transition of this.transitions) {
      if (transition.from !== this.currentState) continue;

      // 检查触发器
      if (event && transition.triggers.length > 0) {
        const triggered = transition.triggers.some(trigger => {
          if (trigger.type !== event.type) return false;
          if (trigger.targetId && trigger.targetId !== event.target) return false;
          if (trigger.key && trigger.key !== event.key) return false;
          return true;
        });
        if (!triggered) continue;
      }

      // 检查条件
      if (transition.conditions.length > 0) {
        const conditionsMet = transition.conditions.every(condition => {
          const value = this.parameters.get(condition.parameter);
          switch (condition.operator) {
            case '==': return value === condition.value;
            case '!=': return value !== condition.value;
            case '>': return value > condition.value;
            case '<': return value < condition.value;
            case '>=': return value >= condition.value;
            case '<=': return value <= condition.value;
            default: return false;
          }
        });
        if (!conditionsMet) continue;
      }

      // 过渡成功
      this.currentState = transition.to;
      return transition.to;
    }

    return null;
  }
}

// ========== RIV导出器 ==========

export interface RivProject {
  version: string;
  artboards: Artboard[];
  animations: Animation[];
  stateMachines: StateMachine[];
  assets: Asset[];
}

export interface Artboard {
  id: string;
  name: string;
  width: number;
  height: number;
  shapes: Shape[];
}

export interface Asset {
  id: string;
  name: string;
  type: 'image' | 'font';
  data: ArrayBuffer;
}

export class RivExporter {
  /**
   * 将项目导出为.riv二进制文件
   * 注意: 这是简化实现,真实的Rive格式需要使用Protobuf并严格遵循官方规范
   */
  async exportToRiv(project: RivProject): Promise<Uint8Array> {
    // 实际实现需要:
    // 1. 定义Protobuf消息格式(参考Rive Runtime源码)
    // 2. 将内部数据结构转换为Rive格式
    // 3. 使用protobuf.js序列化
    
    const jsonData = JSON.stringify({
      version: project.version,
      artboards: project.artboards.map(ab => this.serializeArtboard(ab)),
      animations: project.animations.map(anim => this.serializeAnimation(anim)),
      stateMachines: project.stateMachines.map(sm => this.serializeStateMachine(sm)),
      assets: project.assets.map(asset => this.serializeAsset(asset))
    });

    // 转换为二进制(实际应使用Protobuf)
    const encoder = new TextEncoder();
    return encoder.encode(jsonData);
  }

  private serializeArtboard(artboard: Artboard): any {
    return {
      id: artboard.id,
      name: artboard.name,
      width: artboard.width,
      height: artboard.height,
      shapes: artboard.shapes.map(shape => this.serializeShape(shape))
    };
  }

  private serializeShape(shape: Shape): any {
    const base = {
      id: shape.id,
      name: shape.name,
      transform: shape.transform,
      opacity: shape.opacity,
      visible: shape.visible
    };

    if (shape instanceof Rectangle) {
      return {
        ...base,
        type: 'rectangle',
        width: shape.width,
        height: shape.height,
        cornerRadius: shape.cornerRadius,
        fill: shape.fill,
        stroke: shape.stroke
      };
    } else if (shape instanceof Ellipse) {
      return {
        ...base,
        type: 'ellipse',
        radiusX: shape.radiusX,
        radiusY: shape.radiusY,
        fill: shape.fill,
        stroke: shape.stroke
      };
    } else if (shape instanceof Path) {
      return {
        ...base,
        type: 'path',
        pathData: shape.pathData,
        fill: shape.fill,
        stroke: shape.stroke
      };
    }

    return base;
  }

  private serializeAnimation(animation: Animation): any {
    const tracks: any[] = [];
    animation.tracks.forEach((track, property) => {
      tracks.push({
        property,
        keyframes: track.keyframes
      });
    });

    return {
      id: animation.id,
      name: animation.name,
      duration: animation.duration,
      loop: animation.loop,
      tracks
    };
  }

  private serializeStateMachine(stateMachine: StateMachine): any {
    return {
      id: stateMachine.id,
      name: stateMachine.name,
      states: Array.from(stateMachine.states.values()),
      transitions: stateMachine.transitions,
      entryState: stateMachine.entryState
    };
  }

  private serializeAsset(asset: Asset): any {
    // 将ArrayBuffer转换为Base64
    const bytes = new Uint8Array(asset.data);
    const base64 = btoa(String.fromCharCode(...bytes));

    return {
      id: asset.id,
      name: asset.name,
      type: asset.type,
      data: base64
    };
  }
}

// ========== 导出模块 ==========

export {
  Shape,
  Rectangle,
  Ellipse,
  Path,
  Group,
  AnimationTrack,
  Animation,
  StateMachine,
  RivExporter
};
