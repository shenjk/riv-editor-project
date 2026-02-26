import React, { useRef, useEffect, useCallback } from 'react';
import { useEditorStore } from '@store/useEditorStore';

interface CanvasProps {
  width?: number;
  height?: number;
}

export const Canvas: React.FC<CanvasProps> = ({ width = 800, height = 600 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { 
    currentTool, 
    shapes, 
    selectedShapes,
    addShape,
    zoom,
    pan
  } = useEditorStore();

  // 渲染画布内容
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 清空画布
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();

    // 应用缩放和平移
    ctx.save();
    ctx.translate(pan.x, pan.y);
    ctx.scale(zoom, zoom);

    // 绘制网格
    drawGrid(ctx, canvas.width / zoom, canvas.height / zoom);

    // 绘制所有图形
    shapes.forEach((shape) => {
      drawShape(ctx, shape);
    });

    // 绘制选中框
    selectedShapes.forEach((shapeId) => {
      const shape = shapes.find(s => s.id === shapeId);
      if (shape) {
        drawSelectionBox(ctx, shape);
      }
    });

    ctx.restore();
  }, [shapes, selectedShapes, zoom, pan]);

  // 绘制网格
  const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const gridSize = 20;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;

    // 垂直线
    for (let x = 0; x <= width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    // 水平线
    for (let y = 0; y <= height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  };

  // 绘制图形
  const drawShape = (ctx: CanvasRenderingContext2D, shape: any) => {
    ctx.save();

    ctx.translate(shape.x, shape.y);
    ctx.rotate(shape.rotation || 0);

    switch (shape.type) {
      case 'rect':
        ctx.fillStyle = shape.fill || '#4a9eff';
        ctx.fillRect(-shape.width / 2, -shape.height / 2, shape.width, shape.height);
        break;

      case 'ellipse':
        ctx.fillStyle = shape.fill || '#ff6b9d';
        ctx.beginPath();
        ctx.ellipse(0, 0, shape.radiusX, shape.radiusY, 0, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 'path':
        if (shape.pathData) {
          const path = new Path2D(shape.pathData);
          ctx.fillStyle = shape.fill || '#7b61ff';
          ctx.fill(path);
        }
        break;
    }

    // 绘制描边
    if (shape.stroke) {
      ctx.strokeStyle = shape.stroke.color || '#ffffff';
      ctx.lineWidth = shape.stroke.width || 2;
      ctx.stroke();
    }

    ctx.restore();
  };

  // 绘制选中框
  const drawSelectionBox = (ctx: CanvasRenderingContext2D, shape: any) => {
    ctx.save();
    
    ctx.strokeStyle = '#4a9eff';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);

    let bounds = { x: 0, y: 0, width: 0, height: 0 };

    switch (shape.type) {
      case 'rect':
        bounds = {
          x: shape.x - shape.width / 2,
          y: shape.y - shape.height / 2,
          width: shape.width,
          height: shape.height,
        };
        break;

      case 'ellipse':
        bounds = {
          x: shape.x - shape.radiusX,
          y: shape.y - shape.radiusY,
          width: shape.radiusX * 2,
          height: shape.radiusY * 2,
        };
        break;
    }

    ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);

    // 绘制控制点
    const controlPoints = [
      { x: bounds.x, y: bounds.y }, // 左上
      { x: bounds.x + bounds.width, y: bounds.y }, // 右上
      { x: bounds.x + bounds.width, y: bounds.y + bounds.height }, // 右下
      { x: bounds.x, y: bounds.y + bounds.height }, // 左下
    ];

    ctx.fillStyle = '#4a9eff';
    controlPoints.forEach(point => {
      ctx.fillRect(point.x - 4, point.y - 4, 8, 8);
    });

    ctx.restore();
  };

  // 鼠标事件处理
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - pan.x) / zoom;
    const y = (e.clientY - rect.top - pan.y) / zoom;

    switch (currentTool) {
      case 'rect':
        addShape({
          id: `rect_${Date.now()}`,
          type: 'rect',
          x,
          y,
          width: 100,
          height: 100,
          fill: '#4a9eff',
          rotation: 0,
        });
        break;

      case 'ellipse':
        addShape({
          id: `ellipse_${Date.now()}`,
          type: 'ellipse',
          x,
          y,
          radiusX: 50,
          radiusY: 50,
          fill: '#ff6b9d',
          rotation: 0,
        });
        break;
    }
  };

  // 初始化和渲染循环
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = width;
    canvas.height = height;

    render();
  }, [width, height, render]);

  // 动画循环
  useEffect(() => {
    let animationId: number;

    const animate = () => {
      render();
      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [render]);

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full bg-gray-800 overflow-hidden"
    >
      <canvas
        ref={canvasRef}
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 cursor-crosshair"
        onMouseDown={handleMouseDown}
      />
      
      {/* 状态栏 */}
      <div className="absolute bottom-4 right-4 bg-black bg-opacity-60 px-3 py-1 rounded text-xs font-mono text-gray-400">
        缩放: {Math.round(zoom * 100)}% | 工具: {currentTool}
      </div>
    </div>
  );
};
