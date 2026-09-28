"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import {
  Pencil,
  Eraser,
  Square,
  Circle,
  ArrowRight,
  Minus,
  Trash2,
  Download,
  Palette,
  ZoomIn,
  ZoomOut,
  Move,
  Undo2,
  Redo2,
  Type as TypeIcon,
} from "lucide-react";

type Tool = "pen" | "eraser" | "rect" | "circle" | "line" | "arrow" | "pan" | "text";

interface Point {
  x: number;
  y: number;
}

interface StrokeCmd {
  kind: "stroke";
  tool: Tool;
  color: string;
  width: number;
  pts: Point[];
}

interface ShapeCmd {
  kind: "shape";
  tool: "rect" | "circle" | "line" | "arrow";
  color: string;
  width: number;
  from: Point;
  to: Point;
}

interface TextCmd {
  kind: "text";
  text: string;
  x: number;
  y: number;
  color: string;
  fontSize: number;
}

type DrawCmd = StrokeCmd | ShapeCmd | TextCmd;

const COLORS = [
  "#1a1a1a",
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
  "#ffffff",
];

const WIDTHS = [1, 2, 4, 8, 16];

export function WhiteboardBlock() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const [tool, setTool] = useState<Tool>("pen");
  const [color, setColor] = useState("#1a1a1a");
  const [lineWidth, setLineWidth] = useState(3);
  const [isDark, setIsDark] = useState(false);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState<Point>({ x: 0, y: 0 });

  const cmdsRef = useRef<DrawCmd[]>([]);
  const redoRef = useRef<DrawCmd[]>([]);
  const isDrawingRef = useRef(false);
  const startPtRef = useRef<Point>({ x: 0, y: 0 });
  const currentStrokeRef = useRef<Point[]>([]);
  const panStartRef = useRef<Point>({ x: 0, y: 0 });
  const offsetStartRef = useRef<Point>({ x: 0, y: 0 });
  const [cmdCount, setCmdCount] = useState(0);

  // Detect dark mode
  useEffect(() => {
    const check = () => setIsDark(document.documentElement.classList.contains("dark"));
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  const toCanvas = useCallback((clientX: number, clientY: number): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: (clientX - rect.left - offset.x) / scale,
      y: (clientY - rect.top - offset.y) / scale,
    };
  }, [scale, offset]);

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Grid
    const bg = isDark ? "#1a1a1a" : "#fafafa";
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const gridColor = isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.05)";
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;
    const gridSize = 20 * scale;
    const ox = offset.x % gridSize;
    const oy = offset.y % gridSize;
    for (let x = ox; x < canvas.width; x += gridSize) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
    }
    for (let y = oy; y < canvas.height; y += gridSize) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
    }

    ctx.translate(offset.x, offset.y);
    ctx.scale(scale, scale);

    for (const cmd of cmdsRef.current) {
      ctx.save();
      if (cmd.kind === "stroke") {
        if (cmd.pts.length < 2) { ctx.restore(); continue; }
        ctx.strokeStyle = cmd.tool === "eraser" ? bg : cmd.color;
        ctx.lineWidth = cmd.width / scale;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.globalCompositeOperation = cmd.tool === "eraser" ? "destination-out" : "source-over";
        ctx.beginPath();
        ctx.moveTo(cmd.pts[0].x, cmd.pts[0].y);
        for (let i = 1; i < cmd.pts.length; i++) {
          const mid = { x: (cmd.pts[i - 1].x + cmd.pts[i].x) / 2, y: (cmd.pts[i - 1].y + cmd.pts[i].y) / 2 };
          ctx.quadraticCurveTo(cmd.pts[i - 1].x, cmd.pts[i - 1].y, mid.x, mid.y);
        }
        ctx.stroke();
      } else if (cmd.kind === "shape") {
        ctx.strokeStyle = cmd.color;
        ctx.lineWidth = cmd.width / scale;
        ctx.lineCap = "round";
        const { from, to } = cmd;
        if (cmd.tool === "rect") {
          ctx.strokeRect(from.x, from.y, to.x - from.x, to.y - from.y);
        } else if (cmd.tool === "circle") {
          const rx = Math.abs(to.x - from.x) / 2;
          const ry = Math.abs(to.y - from.y) / 2;
          const cx = Math.min(from.x, to.x) + rx;
          const cy = Math.min(from.y, to.y) + ry;
          ctx.beginPath();
          ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
          ctx.stroke();
        } else if (cmd.tool === "line") {
          ctx.beginPath();
          ctx.moveTo(from.x, from.y);
          ctx.lineTo(to.x, to.y);
          ctx.stroke();
        } else if (cmd.tool === "arrow") {
          const dx = to.x - from.x;
          const dy = to.y - from.y;
          const angle = Math.atan2(dy, dx);
          const headLen = 14 / scale;
          ctx.beginPath();
          ctx.moveTo(from.x, from.y);
          ctx.lineTo(to.x, to.y);
          ctx.lineTo(to.x - headLen * Math.cos(angle - Math.PI / 6), to.y - headLen * Math.sin(angle - Math.PI / 6));
          ctx.moveTo(to.x, to.y);
          ctx.lineTo(to.x - headLen * Math.cos(angle + Math.PI / 6), to.y - headLen * Math.sin(angle + Math.PI / 6));
          ctx.stroke();
        }
      } else if (cmd.kind === "text") {
        ctx.fillStyle = cmd.color;
        ctx.font = `${cmd.fontSize}px "Inter", sans-serif`;
        ctx.fillText(cmd.text, cmd.x, cmd.y);
      }
      ctx.restore();
    }
    ctx.restore();
  }, [isDark, scale, offset]);

  // Resize observer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ro = new ResizeObserver(() => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      redraw();
    });
    ro.observe(canvas);
    return () => ro.disconnect();
  }, [redraw]);

  useEffect(() => { redraw(); }, [redraw]);

  // Draw preview on overlay canvas
  const drawPreview = useCallback((from: Point, to: Point) => {
    const ov = overlayRef.current;
    if (!ov) return;
    const ctx = ov.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, ov.width, ov.height);
    ctx.save();
    ctx.translate(offset.x, offset.y);
    ctx.scale(scale, scale);
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth / scale;
    ctx.lineCap = "round";
    ctx.setLineDash([5 / scale, 3 / scale]);

    if (tool === "rect") {
      ctx.strokeRect(from.x, from.y, to.x - from.x, to.y - from.y);
    } else if (tool === "circle") {
      const rx = Math.abs(to.x - from.x) / 2;
      const ry = Math.abs(to.y - from.y) / 2;
      const cx = Math.min(from.x, to.x) + rx;
      const cy = Math.min(from.y, to.y) + ry;
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
      ctx.stroke();
    } else if (tool === "line" || tool === "arrow") {
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.stroke();
    }
    ctx.restore();
  }, [color, lineWidth, scale, offset, tool]);

  const getPoint = (e: React.MouseEvent | MouseEvent): Point => {
    return toCanvas(
      "clientX" in e ? (e as MouseEvent).clientX : 0,
      "clientY" in e ? (e as MouseEvent).clientY : 0
    );
  };

  const onMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const pt = toCanvas(e.clientX, e.clientY);
    isDrawingRef.current = true;
    startPtRef.current = pt;

    if (tool === "pan") {
      panStartRef.current = { x: e.clientX, y: e.clientY };
      offsetStartRef.current = { ...offset };
      return;
    }

    if (tool === "text") {
      const text = prompt("Enter text:");
      if (text) {
        const cmd: TextCmd = { kind: "text", text, x: pt.x, y: pt.y, color, fontSize: 16 };
        cmdsRef.current = [...cmdsRef.current, cmd];
        redoRef.current = [];
        setCmdCount(cmdsRef.current.length);
        redraw();
      }
      isDrawingRef.current = false;
      return;
    }

    if (tool === "pen" || tool === "eraser") {
      currentStrokeRef.current = [pt];
    }
  }, [tool, color, offset, toCanvas, redraw]);

  const onMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    const pt = toCanvas(e.clientX, e.clientY);

    if (tool === "pan") {
      const dx = e.clientX - panStartRef.current.x;
      const dy = e.clientY - panStartRef.current.y;
      setOffset({ x: offsetStartRef.current.x + dx, y: offsetStartRef.current.y + dy });
      return;
    }

    if (tool === "pen" || tool === "eraser") {
      currentStrokeRef.current.push(pt);
      // Draw live stroke
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx && currentStrokeRef.current.length >= 2) {
          ctx.save();
          ctx.translate(offset.x, offset.y);
          ctx.scale(scale, scale);
          const pts = currentStrokeRef.current;
          const l = pts.length;
          ctx.strokeStyle = tool === "eraser" ? (isDark ? "#1a1a1a" : "#fafafa") : color;
          ctx.lineWidth = lineWidth / scale;
          ctx.lineCap = "round";
          ctx.lineJoin = "round";
          ctx.globalCompositeOperation = tool === "eraser" ? "destination-out" : "source-over";
          ctx.beginPath();
          ctx.moveTo(pts[l - 2].x, pts[l - 2].y);
          const mid = { x: (pts[l - 2].x + pts[l - 1].x) / 2, y: (pts[l - 2].y + pts[l - 1].y) / 2 };
          ctx.quadraticCurveTo(pts[l - 2].x, pts[l - 2].y, mid.x, mid.y);
          ctx.stroke();
          ctx.restore();
        }
      }
    } else if (["rect", "circle", "line", "arrow"].includes(tool)) {
      drawPreview(startPtRef.current, pt);
    }
  }, [tool, color, lineWidth, scale, offset, isDark, toCanvas, drawPreview]);

  const onMouseUp = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;

    if (tool === "pan") return;

    const ov = overlayRef.current;
    if (ov) {
      const ctx = ov.getContext("2d");
      ctx?.clearRect(0, 0, ov.width, ov.height);
    }

    if (tool === "pen" || tool === "eraser") {
      const pts = currentStrokeRef.current;
      if (pts.length >= 2) {
        const cmd: StrokeCmd = { kind: "stroke", tool, color, width: lineWidth, pts: [...pts] };
        cmdsRef.current = [...cmdsRef.current, cmd];
        redoRef.current = [];
        setCmdCount(cmdsRef.current.length);
        redraw();
      }
      currentStrokeRef.current = [];
    } else if (["rect", "circle", "line", "arrow"].includes(tool)) {
      const to = toCanvas(e.clientX, e.clientY);
      const from = startPtRef.current;
      if (Math.abs(to.x - from.x) > 2 || Math.abs(to.y - from.y) > 2) {
        const cmd: ShapeCmd = { kind: "shape", tool: tool as "rect" | "circle" | "line" | "arrow", color, width: lineWidth, from, to };
        cmdsRef.current = [...cmdsRef.current, cmd];
        redoRef.current = [];
        setCmdCount(cmdsRef.current.length);
        redraw();
      }
    }
  }, [tool, color, lineWidth, toCanvas, redraw]);

  const handleUndo = () => {
    if (!cmdsRef.current.length) return;
    const last = cmdsRef.current.pop()!;
    redoRef.current.push(last);
    redraw();
    setCmdCount(cmdsRef.current.length);
  };

  const handleRedo = () => {
    if (!redoRef.current.length) return;
    const next = redoRef.current.pop()!;
    cmdsRef.current.push(next);
    redraw();
    setCmdCount(cmdsRef.current.length);
  };

  const handleClear = () => {
    if (!confirm("Clear the whiteboard?")) return;
    cmdsRef.current = [];
    redoRef.current = [];
    redraw();
    setCmdCount(0);
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = "whiteboard.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const zoom = (dir: 1 | -1) => {
    setScale(prev => Math.max(0.25, Math.min(4, prev + dir * 0.25)));
  };

  const toolConfig: { tool: Tool; icon: React.ReactNode; title: string }[] = [
    { tool: "pen",    icon: <Pencil className="h-4 w-4" />,    title: "Pen" },
    { tool: "eraser", icon: <Eraser className="h-4 w-4" />,   title: "Eraser" },
    { tool: "line",   icon: <Minus className="h-4 w-4" />,    title: "Line" },
    { tool: "arrow",  icon: <ArrowRight className="h-4 w-4" />, title: "Arrow" },
    { tool: "rect",   icon: <Square className="h-4 w-4" />,   title: "Rectangle" },
    { tool: "circle", icon: <Circle className="h-4 w-4" />,   title: "Ellipse" },
    { tool: "text",   icon: <TypeIcon className="h-4 w-4" />, title: "Text" },
    { tool: "pan",    icon: <Move className="h-4 w-4" />,     title: "Pan" },
  ];

  return (
    <div className="my-3 rounded-2xl border border-foreground/10 overflow-hidden bg-[#fafafa] dark:bg-[#1a1a1a] shadow-sm">
      {/* Toolbar */}
      <div className="flex items-center gap-1 px-3 py-2 border-b border-foreground/[0.07] bg-white/80 dark:bg-[#111]/80 backdrop-blur-sm flex-wrap">
        {/* Tools */}
        <div className="flex items-center gap-0.5 mr-2">
          {toolConfig.map((t) => (
            <button
              key={t.tool}
              type="button"
              title={t.title}
              onClick={() => setTool(t.tool)}
              className={`p-1.5 rounded-lg transition-all ${
                tool === t.tool
                  ? "bg-blue-500/20 text-blue-600 dark:text-blue-400 shadow-inner"
                  : "text-foreground/50 hover:text-foreground hover:bg-foreground/[0.06]"
              }`}
            >
              {t.icon}
            </button>
          ))}
        </div>

        {/* Divider */}
        <div className="w-px h-5 bg-foreground/10 mr-2" />

        {/* Colors */}
        <div className="flex items-center gap-1 mr-2">
          <Palette className="h-3.5 w-3.5 text-foreground/40 shrink-0" />
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={`h-5 w-5 rounded-full border-2 transition-transform hover:scale-110 ${
                color === c ? "border-blue-500 scale-110" : "border-transparent"
              }`}
              style={{ background: c }}
            />
          ))}
        </div>

        {/* Divider */}
        <div className="w-px h-5 bg-foreground/10 mr-2" />

        {/* Line width */}
        <div className="flex items-center gap-1 mr-2">
          {WIDTHS.map((w) => (
            <button
              key={w}
              type="button"
              onClick={() => setLineWidth(w)}
              className={`flex items-center justify-center h-6 w-6 rounded-md transition-all ${
                lineWidth === w
                  ? "bg-foreground/15 text-foreground"
                  : "text-foreground/40 hover:bg-foreground/[0.06]"
              }`}
            >
              <div
                className="rounded-full bg-current"
                style={{ width: Math.min(w + 6, 18), height: Math.min(w, 6) }}
              />
            </button>
          ))}
        </div>

        {/* Divider */}
        <div className="w-px h-5 bg-foreground/10 mr-2" />

        {/* Zoom & actions */}
        <div className="flex items-center gap-0.5">
          <button type="button" onClick={() => zoom(-1)} title="Zoom out" className="p-1.5 rounded-lg text-foreground/50 hover:text-foreground hover:bg-foreground/[0.06] transition-all">
            <ZoomOut className="h-4 w-4" />
          </button>
          <span className="text-xs font-mono text-foreground/40 min-w-[3rem] text-center select-none">{Math.round(scale * 100)}%</span>
          <button type="button" onClick={() => zoom(1)} title="Zoom in" className="p-1.5 rounded-lg text-foreground/50 hover:text-foreground hover:bg-foreground/[0.06] transition-all">
            <ZoomIn className="h-4 w-4" />
          </button>
        </div>

        <div className="ml-auto flex items-center gap-0.5">
          <button type="button" onClick={handleUndo} title="Undo" className="p-1.5 rounded-lg text-foreground/50 hover:text-foreground hover:bg-foreground/[0.06] transition-all">
            <Undo2 className="h-4 w-4" />
          </button>
          <button type="button" onClick={handleRedo} title="Redo" className="p-1.5 rounded-lg text-foreground/50 hover:text-foreground hover:bg-foreground/[0.06] transition-all">
            <Redo2 className="h-4 w-4" />
          </button>
          <button type="button" onClick={handleDownload} title="Download as PNG" className="p-1.5 rounded-lg text-foreground/50 hover:text-blue-500 hover:bg-blue-500/10 transition-all">
            <Download className="h-4 w-4" />
          </button>
          <button type="button" onClick={handleClear} title="Clear board" className="p-1.5 rounded-lg text-foreground/50 hover:text-red-500 hover:bg-red-500/10 transition-all">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Canvas area */}
      <div
        className="relative overflow-hidden"
        style={{ height: 400, cursor: tool === "pan" ? "grab" : tool === "eraser" ? "cell" : "crosshair" }}
      >
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
        />
        <canvas
          ref={overlayRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
        />
        {/* Empty state hint */}
        {cmdCount === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
            <div className="flex flex-col items-center gap-2 text-foreground/20">
              <Pencil className="h-8 w-8" />
              <span className="text-sm font-medium">Start drawing</span>
              <span className="text-xs">Use the toolbar above to select a tool</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
