"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import {
  ChevronLeft,
  Type,
  ImageIcon,
  Palette,
  QrCode,
  Sparkles,
  LayoutTemplate,
  Save,
  Eye,
  Undo2,
  Redo2,
  Trash2,
  Move,
  ZoomIn,
  ZoomOut,
  Bold,
  Italic,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Upload,
  Copy,
  X,
  Layers,
  CheckCircle2,
  Square,
  ShoppingCart,
  Minus,
  Plus,
  Lock,
  Unlock,
  RotateCcw,
  Underline,
  Strikethrough,
  ChevronUp,
  ChevronDown,
  ChevronsUp,
  ChevronsDown,
  Keyboard,
  ClipboardPaste,
  Wand2,
} from "lucide-react";
import { useProduct } from "@/hooks/use-products";
import { useAddToCart } from "@/hooks/use-add-to-cart";
import { toast } from "react-toastify";

// â”€â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
type ToolType = "select" | "text" | "image" | "color" | "qr" | "finish" | "template" | "shapes";
type FinishType = "matte" | "glossy" | "embossed" | "spot-uv";
type ShapeType = "rectangle" | "circle" | "triangle" | "diamond" | "star";

/** A product view definition (front, back, left, right, top, bottom) */
interface ProductView {
  id: string;
  viewKey: string;
  name: string;
  baseImageUrl: string;
  description: string | null;
  sortOrder: number;
  isDefault: boolean;
}

interface TextElement {
  type: "text";
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: "normal" | "bold";
  fontStyle: "normal" | "italic";
  textAlign: "left" | "center" | "right";
  color: string;
  rotation: number;
  opacity: number;
  locked: boolean;
  letterSpacing: number;
  lineHeight: number;
  textDecoration: "none" | "underline" | "line-through";
  textTransform: "none" | "uppercase" | "lowercase" | "capitalize";
  strokeColor: string;
  strokeWidth: number;
}

interface ImageElement {
  type: "image";
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  src: string;
  rotation: number;
  opacity: number;
  locked: boolean;
  flipX: boolean;
  flipY: boolean;
  borderRadius: number;
  brightness: number;
  contrast: number;
  grayscale: boolean;
}

interface QRElement {
  type: "qr";
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  data: string;
  color: string;
  bgColor: string;
  rotation: number;
  opacity: number;
  locked: boolean;
}

interface ShapeElement {
  type: "shape";
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  shape: ShapeType;
  fillColor: string;
  strokeColor: string;
  strokeWidth: number;
  rx: number;
  rotation: number;
  opacity: number;
  locked: boolean;
}

type DesignElement = TextElement | ImageElement | QRElement | ShapeElement;

/** Per-view design state (canvas overlay only) */
interface ViewDesignState {
  elements: DesignElement[];
  backgroundColor: string;
  backgroundPattern: string | null;
  backgroundGradient: string | null;
  finish: FinishType;
  canvasWidth: number;
  canvasHeight: number;
}

/** Serialised format stored in SavedDesign.designData (version 3) */
interface MultiViewDesignData {
  version: "3";
  views: Record<string, ViewDesignState>;
}

const DEFAULT_VIEW_DESIGN: ViewDesignState = {
  elements: [],
  backgroundColor: "#ffffff",
  backgroundPattern: null,
  backgroundGradient: null,
  finish: "matte",
  canvasWidth: 600,
  canvasHeight: 400,
};

// â”€â”€â”€ Templates â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const TEMPLATES: { id: string; name: string; thumbnail: string; elements: DesignElement[]; backgroundColor: string }[] = [
  {
    id: "blank",
    name: "Blank Canvas",
    thumbnail: "",
    elements: [],
    backgroundColor: "#ffffff",
  },
  {
    id: "minimal-brand",
    name: "Minimal Brand",
    thumbnail: "",
    elements: [
      {
        type: "text",
        id: "t1",
        x: 300,
        y: 185,
        width: 260,
        height: 55,
        text: "Your Brand",
        fontFamily: "Georgia",
        fontSize: 34,
        fontWeight: "bold",
        fontStyle: "normal",
        textAlign: "center",
        color: "#1a1a1a",
        rotation: 0,
        opacity: 1,
        locked: false,
        letterSpacing: 2,
        lineHeight: 1.2,
        textDecoration: "none",
        textTransform: "none",
        strokeColor: "transparent",
        strokeWidth: 0,
      },
      {
        type: "text",
        id: "t2",
        x: 300,
        y: 250,
        width: 260,
        height: 30,
        text: "Premium Packaging",
        fontFamily: "Inter",
        fontSize: 13,
        fontWeight: "normal",
        fontStyle: "italic",
        textAlign: "center",
        color: "#888888",
        rotation: 0,
        opacity: 1,
        locked: false,
        letterSpacing: 3,
        lineHeight: 1.5,
        textDecoration: "none",
        textTransform: "uppercase",
        strokeColor: "transparent",
        strokeWidth: 0,
      },
    ],
    backgroundColor: "#ffffff",
  },
  {
    id: "bold-colors",
    name: "Bold & Colorful",
    thumbnail: "",
    elements: [
      {
        type: "shape",
        id: "s1",
        x: 300,
        y: 200,
        width: 580,
        height: 380,
        shape: "rectangle",
        fillColor: "#7c3aed",
        strokeColor: "transparent",
        strokeWidth: 0,
        rx: 0,
        rotation: 0,
        opacity: 1,
        locked: true,
      },
      {
        type: "text",
        id: "t1",
        x: 300,
        y: 200,
        width: 280,
        height: 70,
        text: "BRAND NAME",
        fontFamily: "Inter",
        fontSize: 38,
        fontWeight: "bold",
        fontStyle: "normal",
        textAlign: "center",
        color: "#ffffff",
        rotation: 0,
        opacity: 1,
        locked: false,
        letterSpacing: 4,
        lineHeight: 1.2,
        textDecoration: "none",
        textTransform: "uppercase",
        strokeColor: "transparent",
        strokeWidth: 0,
      },
    ],
    backgroundColor: "#7c3aed",
  },
  {
    id: "eco-friendly",
    name: "Eco Friendly",
    thumbnail: "",
    elements: [
      {
        type: "text",
        id: "t1",
        x: 300,
        y: 170,
        width: 220,
        height: 50,
        text: "ECO",
        fontFamily: "Georgia",
        fontSize: 30,
        fontWeight: "bold",
        fontStyle: "normal",
        textAlign: "center",
        color: "#166534",
        rotation: 0,
        opacity: 1,
        locked: false,
        letterSpacing: 6,
        lineHeight: 1.2,
        textDecoration: "none",
        textTransform: "uppercase",
        strokeColor: "transparent",
        strokeWidth: 0,
      },
      {
        type: "text",
        id: "t2",
        x: 300,
        y: 230,
        width: 280,
        height: 35,
        text: "Sustainable Packaging",
        fontFamily: "Inter",
        fontSize: 14,
        fontWeight: "normal",
        fontStyle: "italic",
        textAlign: "center",
        color: "#166534",
        rotation: 0,
        opacity: 1,
        locked: false,
        letterSpacing: 1,
        lineHeight: 1.5,
        textDecoration: "none",
        textTransform: "none",
        strokeColor: "transparent",
        strokeWidth: 0,
      },
    ],
    backgroundColor: "#dcfce7",
  },
  {
    id: "corporate",
    name: "Corporate Pro",
    thumbnail: "",
    elements: [
      {
        type: "shape",
        id: "s1",
        x: 300,
        y: 60,
        width: 580,
        height: 80,
        shape: "rectangle",
        fillColor: "#1e3a5f",
        strokeColor: "transparent",
        strokeWidth: 0,
        rx: 0,
        rotation: 0,
        opacity: 1,
        locked: true,
      },
      {
        type: "text",
        id: "t1",
        x: 300,
        y: 60,
        width: 300,
        height: 40,
        text: "ACME CORPORATION",
        fontFamily: "Inter",
        fontSize: 18,
        fontWeight: "bold",
        fontStyle: "normal",
        textAlign: "center",
        color: "#ffffff",
        rotation: 0,
        opacity: 1,
        locked: false,
        letterSpacing: 3,
        lineHeight: 1.2,
        textDecoration: "none",
        textTransform: "uppercase",
        strokeColor: "transparent",
        strokeWidth: 0,
      },
      {
        type: "text",
        id: "t2",
        x: 300,
        y: 215,
        width: 320,
        height: 40,
        text: "Quality You Can Trust",
        fontFamily: "Georgia",
        fontSize: 22,
        fontWeight: "normal",
        fontStyle: "italic",
        textAlign: "center",
        color: "#1e3a5f",
        rotation: 0,
        opacity: 1,
        locked: false,
        letterSpacing: 1,
        lineHeight: 1.5,
        textDecoration: "none",
        textTransform: "none",
        strokeColor: "transparent",
        strokeWidth: 0,
      },
    ],
    backgroundColor: "#f0f4f8",
  },
  {
    id: "fun-festive",
    name: "Fun & Festive",
    thumbnail: "",
    elements: [
      {
        type: "shape",
        id: "s1",
        x: 300,
        y: 200,
        width: 200,
        height: 200,
        shape: "star",
        fillColor: "#f59e0b",
        strokeColor: "#ffffff",
        strokeWidth: 3,
        rx: 0,
        rotation: 0,
        opacity: 0.25,
        locked: true,
      },
      {
        type: "text",
        id: "t1",
        x: 300,
        y: 185,
        width: 280,
        height: 60,
        text: "CELEBRATE!",
        fontFamily: "Impact",
        fontSize: 40,
        fontWeight: "bold",
        fontStyle: "normal",
        textAlign: "center",
        color: "#dc2626",
        rotation: 0,
        opacity: 1,
        locked: false,
        letterSpacing: 3,
        lineHeight: 1.2,
        textDecoration: "none",
        textTransform: "uppercase",
        strokeColor: "#ffffff",
        strokeWidth: 2,
      },
      {
        type: "text",
        id: "t2",
        x: 300,
        y: 250,
        width: 220,
        height: 30,
        text: "Special Edition",
        fontFamily: "Georgia",
        fontSize: 16,
        fontWeight: "normal",
        fontStyle: "italic",
        textAlign: "center",
        color: "#f97316",
        rotation: 0,
        opacity: 1,
        locked: false,
        letterSpacing: 2,
        lineHeight: 1.4,
        textDecoration: "none",
        textTransform: "none",
        strokeColor: "transparent",
        strokeWidth: 0,
      },
    ],
    backgroundColor: "#fef9c3",
  },
  {
    id: "luxury",
    name: "Luxury Gold",
    thumbnail: "",
    elements: [
      {
        type: "shape",
        id: "s1",
        x: 300,
        y: 200,
        width: 560,
        height: 360,
        shape: "rectangle",
        fillColor: "#1a1a1a",
        strokeColor: "#d97706",
        strokeWidth: 3,
        rx: 4,
        rotation: 0,
        opacity: 1,
        locked: true,
      },
      {
        type: "text",
        id: "t1",
        x: 300,
        y: 185,
        width: 300,
        height: 55,
        text: "LUXE",
        fontFamily: "Georgia",
        fontSize: 50,
        fontWeight: "bold",
        fontStyle: "normal",
        textAlign: "center",
        color: "#f59e0b",
        rotation: 0,
        opacity: 1,
        locked: false,
        letterSpacing: 12,
        lineHeight: 1.2,
        textDecoration: "none",
        textTransform: "uppercase",
        strokeColor: "transparent",
        strokeWidth: 0,
      },
      {
        type: "text",
        id: "t2",
        x: 300,
        y: 248,
        width: 260,
        height: 28,
        text: "Est. 2024 · Premium Quality",
        fontFamily: "Inter",
        fontSize: 11,
        fontWeight: "normal",
        fontStyle: "normal",
        textAlign: "center",
        color: "#d97706",
        rotation: 0,
        opacity: 0.85,
        locked: false,
        letterSpacing: 4,
        lineHeight: 1.2,
        textDecoration: "none",
        textTransform: "uppercase",
        strokeColor: "transparent",
        strokeWidth: 0,
      },
    ],
    backgroundColor: "#1a1a1a",
  },
  {
    id: "startup",
    name: "Modern Startup",
    thumbnail: "",
    elements: [
      {
        type: "shape",
        id: "s1",
        x: 155,
        y: 200,
        width: 60,
        height: 380,
        shape: "rectangle",
        fillColor: "#6366f1",
        strokeColor: "transparent",
        strokeWidth: 0,
        rx: 30,
        rotation: 0,
        opacity: 1,
        locked: true,
      },
      {
        type: "text",
        id: "t1",
        x: 330,
        y: 190,
        width: 260,
        height: 50,
        text: "STARTUP",
        fontFamily: "Inter",
        fontSize: 30,
        fontWeight: "bold",
        fontStyle: "normal",
        textAlign: "left",
        color: "#1a1a1a",
        rotation: 0,
        opacity: 1,
        locked: false,
        letterSpacing: 2,
        lineHeight: 1.2,
        textDecoration: "none",
        textTransform: "none",
        strokeColor: "transparent",
        strokeWidth: 0,
      },
      {
        type: "text",
        id: "t2",
        x: 330,
        y: 248,
        width: 240,
        height: 30,
        text: "Disruptive. Bold. Different.",
        fontFamily: "Inter",
        fontSize: 12,
        fontWeight: "normal",
        fontStyle: "normal",
        textAlign: "left",
        color: "#6b7280",
        rotation: 0,
        opacity: 1,
        locked: false,
        letterSpacing: 0.5,
        lineHeight: 1.5,
        textDecoration: "none",
        textTransform: "none",
        strokeColor: "transparent",
        strokeWidth: 0,
      },
    ],
    backgroundColor: "#f8fafc",
  },
];

const COLORS = [
  "#ffffff", "#f8fafc", "#f1f5f9", "#e2e8f0", "#cbd5e1", "#94a3b8",
  "#1a1a1a", "#374151", "#4b5563", "#6b7280", "#9ca3af", "#d1d5db",
  "#ef4444", "#f97316", "#f59e0b", "#eab308", "#84cc16", "#22c55e",
  "#14b8a6", "#06b6d4", "#3b82f6", "#6366f1", "#8b5cf6", "#a855f7",
  "#ec4899", "#f43f5e", "#7c3aed", "#2563eb", "#0891b2", "#059669",
  "#dc2626", "#ea580c", "#d97706", "#ca8a04", "#65a30d", "#16a34a",
];

const FONT_FAMILIES = [
  "Inter",
  "Georgia",
  "Arial",
  "Helvetica",
  "Times New Roman",
  "Courier New",
  "Verdana",
  "Trebuchet MS",
  "Impact",
  "Palatino",
  "Garamond",
  "Book Antiqua",
  "Comic Sans MS",
];

const PATTERNS = [
  { id: "none", name: "None" },
  { id: "dots", name: "Dots" },
  { id: "stripes", name: "Stripes" },
  { id: "grid", name: "Grid" },
  { id: "diagonal", name: "Diagonal" },
  { id: "cross", name: "Cross" },
  { id: "circles", name: "Circles" },
  { id: "zigzag", name: "Zigzag" },
];

const FINISH_OPTIONS: { id: FinishType; name: string; description: string }[] = [
  { id: "matte", name: "Matte", description: "Smooth, non-reflective finish" },
  { id: "glossy", name: "Glossy", description: "High-shine reflective finish" },
  { id: "embossed", name: "Embossed", description: "Raised 3D texture effect" },
  { id: "spot-uv", name: "Spot UV", description: "Selective gloss coating" },
];

const GRADIENTS: { id: string; name: string; value: string | null }[] = [
  { id: "none", name: "None", value: null },
  { id: "sunset", name: "Sunset", value: "linear-gradient(135deg, #f97316, #ec4899)" },
  { id: "ocean", name: "Ocean", value: "linear-gradient(135deg, #06b6d4, #6366f1)" },
  { id: "forest", name: "Forest", value: "linear-gradient(135deg, #22c55e, #14b8a6)" },
  { id: "purple", name: "Purple", value: "linear-gradient(135deg, #8b5cf6, #ec4899)" },
  { id: "gold", name: "Gold", value: "linear-gradient(135deg, #f59e0b, #ef4444)" },
  { id: "sky", name: "Sky", value: "linear-gradient(135deg, #60a5fa, #a78bfa)" },
  { id: "dark", name: "Dark", value: "linear-gradient(135deg, #1a1a1a, #374151)" },
  { id: "pearl", name: "Pearl", value: "linear-gradient(135deg, #f8fafc, #e2e8f0)" },
];

function generateId() {
  return `el_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

// â”€â”€â”€ Simple QR code SVG generator â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function QRCodeSVG({ data, color, bgColor, size }: { data: string; color: string; bgColor: string; size: number }) {
  const cells = 11;
  const cellSize = size / cells;
  const pattern: boolean[][] = [];
  for (let r = 0; r < cells; r++) {
    pattern[r] = [];
    for (let c = 0; c < cells; c++) {
      const isFinderTL = r < 3 && c < 3;
      const isFinderTR = r < 3 && c >= cells - 3;
      const isFinderBL = r >= cells - 3 && c < 3;
      if (isFinderTL || isFinderTR || isFinderBL) { pattern[r][c] = true; continue; }
      const hash = (data.charCodeAt((r * cells + c) % data.length) || 0) + r * 7 + c * 13;
      pattern[r][c] = hash % 3 !== 0;
    }
  }
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <rect width={size} height={size} fill={bgColor} />
      {pattern.map((row, r) =>
        row.map((cell, c) =>
          cell ? <rect key={`${r}-${c}`} x={c * cellSize} y={r * cellSize} width={cellSize} height={cellSize} fill={color} /> : null
        )
      )}
    </svg>
  );
}

// â”€â”€â”€ Shape SVG renderer â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function ShapeSVG({ shape, width, height, fillColor, strokeColor, strokeWidth, rx }: {
  shape: ShapeType; width: number; height: number;
  fillColor: string; strokeColor: string; strokeWidth: number; rx: number;
}) {
  const sw = strokeWidth;
  switch (shape) {
    case "rectangle":
      return (
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: "block" }}>
          <rect x={sw / 2} y={sw / 2} width={width - sw} height={height - sw} rx={rx} fill={fillColor} stroke={strokeColor} strokeWidth={sw} />
        </svg>
      );
    case "circle":
      return (
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: "block" }}>
          <ellipse cx={width / 2} cy={height / 2} rx={width / 2 - sw / 2} ry={height / 2 - sw / 2} fill={fillColor} stroke={strokeColor} strokeWidth={sw} />
        </svg>
      );
    case "triangle": {
      const pts = `${width / 2},${sw} ${sw},${height - sw} ${width - sw},${height - sw}`;
      return (
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: "block" }}>
          <polygon points={pts} fill={fillColor} stroke={strokeColor} strokeWidth={sw} />
        </svg>
      );
    }
    case "diamond": {
      const pts = `${width / 2},${sw} ${width - sw},${height / 2} ${width / 2},${height - sw} ${sw},${height / 2}`;
      return (
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: "block" }}>
          <polygon points={pts} fill={fillColor} stroke={strokeColor} strokeWidth={sw} />
        </svg>
      );
    }
    case "star": {
      const cx = width / 2, cy = height / 2;
      const outerR = Math.min(width, height) / 2 - sw;
      const innerR = outerR * 0.42;
      const pts: string[] = [];
      for (let i = 0; i < 10; i++) {
        const angle = (i * Math.PI) / 5 - Math.PI / 2;
        const r = i % 2 === 0 ? outerR : innerR;
        pts.push(`${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`);
      }
      return (
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: "block" }}>
          <polygon points={pts.join(" ")} fill={fillColor} stroke={strokeColor} strokeWidth={sw} />
        </svg>
      );
    }
    default: return null;
  }
}

// â”€â”€â”€ Canvas Pattern Renderer â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function getPatternStyle(pattern: string | null, bgColor: string, gradient: string | null): React.CSSProperties {
  const base: React.CSSProperties = gradient ? { backgroundImage: gradient } : { backgroundColor: bgColor };
  if (!pattern || pattern === "none") return base;
  const pc = `rgba(0,0,0,0.07)`;
  switch (pattern) {
    case "dots":
      return { ...base, backgroundImage: `${gradient ? gradient + "," : ""}radial-gradient(${pc} 1.5px, transparent 1.5px)`, backgroundSize: "16px 16px" };
    case "stripes":
      return { ...base, backgroundImage: `${gradient ? gradient + "," : ""}repeating-linear-gradient(0deg, ${pc}, ${pc} 1px, transparent 1px, transparent 12px)` };
    case "grid":
      return { ...base, backgroundImage: `${gradient ? gradient + "," : ""}linear-gradient(${pc} 1px, transparent 1px), linear-gradient(90deg, ${pc} 1px, transparent 1px)`, backgroundSize: "20px 20px" };
    case "diagonal":
      return { ...base, backgroundImage: `${gradient ? gradient + "," : ""}repeating-linear-gradient(45deg, ${pc}, ${pc} 1px, transparent 1px, transparent 14px)` };
    case "cross":
      return { ...base, backgroundImage: `${gradient ? gradient + "," : ""}linear-gradient(${pc} 1px, transparent 1px), linear-gradient(90deg, ${pc} 1px, transparent 1px)`, backgroundSize: "12px 12px" };
    case "circles":
      return { ...base, backgroundImage: `${gradient ? gradient + "," : ""}radial-gradient(circle, ${pc} 2px, transparent 2px)`, backgroundSize: "24px 24px" };
    case "zigzag":
      return { ...base, backgroundImage: `${gradient ? gradient + "," : ""}repeating-linear-gradient(135deg, ${pc}, ${pc} 1px, transparent 1px, transparent 8px), repeating-linear-gradient(45deg, ${pc}, ${pc} 1px, transparent 1px, transparent 8px)` };
    default:
      return base;
  }
}

// â”€â”€â”€ Main Editor Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default function CustomizeProductPage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = params;
  const { product, loading, error } = useProduct(slug);
  const addToCartDispatch = useAddToCart();
  const searchParams = useSearchParams();

  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // â”€â”€ View state â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const [productViews, setProductViews] = useState<ProductView[]>([]);
  const [viewsLoading, setViewsLoading] = useState(true);
  const [viewDesigns, setViewDesigns] = useState<Record<string, ViewDesignState>>({});
  const [activeViewKey, setActiveViewKey] = useState<string>("");

  const currentDesign: ViewDesignState = viewDesigns[activeViewKey] ?? DEFAULT_VIEW_DESIGN;

  // â”€â”€ Editor state â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const [activeTool, setActiveTool] = useState<ToolType>("select");
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [saving, setSaving] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [showPrintSpecs, setShowPrintSpecs] = useState(false);
  const [designName, setDesignName] = useState("Untitled Design");
  const [existingDesignId, setExistingDesignId] = useState<string | null>(null);
  const [dragging, setDragging] = useState<{ elementId: string; offsetX: number; offsetY: number } | null>(null);
  const [qrInput, setQrInput] = useState("https://pac8.store");
  const [qrBgColor, setQrBgColor] = useState("#ffffff");
  const [quantity, setQuantity] = useState(1);
  const [rightPanelTab, setRightPanelTab] = useState<"product" | "layers" | "summary">("product");
  const [clipboard, setClipboard] = useState<DesignElement | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [snapIndicator, setSnapIndicator] = useState<{ x: boolean; y: boolean }>({ x: false, y: false });
  const [mobilePanelOpenState, setMobilePanelOpenState] = useState(false);

  // Shape tool state
  const [shapeType, setShapeType] = useState<ShapeType>("rectangle");
  const [shapeFill, setShapeFill] = useState("#6366f1");
  const [shapeStroke, setShapeStroke] = useState("transparent");
  const [shapeStrokeWidth, setShapeStrokeWidth] = useState(0);
  const [shapeRx, setShapeRx] = useState(0);

  const selectedElement = currentDesign.elements.find((el) => el.id === selectedElementId) ?? null;

  // â”€â”€ Per-view undo/redo â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const historyRef = useRef<Record<string, ViewDesignState[]>>({});
  const historyIndexRef = useRef<Record<string, number>>({});
  const [, setHistoryTick] = useState(0);
  const tickRender = useCallback(() => setHistoryTick((t) => t + 1), []);

  const pushHistory = useCallback((viewKey: string, newDesign: ViewDesignState) => {
    if (!historyRef.current[viewKey]) {
      historyRef.current[viewKey] = [newDesign];
      historyIndexRef.current[viewKey] = 0;
      return;
    }
    const idx = historyIndexRef.current[viewKey];
    historyRef.current[viewKey] = [...historyRef.current[viewKey].slice(0, idx + 1), newDesign];
    historyIndexRef.current[viewKey] = idx + 1;
    tickRender();
  }, [tickRender]);

  const undo = useCallback(() => {
    const idx = historyIndexRef.current[activeViewKey] ?? 0;
    if (idx > 0) {
      historyIndexRef.current[activeViewKey] = idx - 1;
      const prev = historyRef.current[activeViewKey][idx - 1];
      setViewDesigns((vd) => ({ ...vd, [activeViewKey]: prev }));
      tickRender();
    }
  }, [activeViewKey, tickRender]);

  const redo = useCallback(() => {
    const idx = historyIndexRef.current[activeViewKey] ?? 0;
    const hist = historyRef.current[activeViewKey] ?? [];
    if (idx < hist.length - 1) {
      historyIndexRef.current[activeViewKey] = idx + 1;
      const next = hist[idx + 1];
      setViewDesigns((vd) => ({ ...vd, [activeViewKey]: next }));
      tickRender();
    }
  }, [activeViewKey, tickRender]);

  const updateDesign = useCallback(
    (updater: (prev: ViewDesignState) => ViewDesignState) => {
      setViewDesigns((prev) => {
        const current = prev[activeViewKey] ?? DEFAULT_VIEW_DESIGN;
        const next = updater(current);
        pushHistory(activeViewKey, next);
        return { ...prev, [activeViewKey]: next };
      });
    },
    [activeViewKey, pushHistory]
  );

  // â”€â”€ Load product views from API â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // Fetch both product views and any existing saved design in parallel,
  // then set state ONCE. This prevents the race condition where the
  // views-reset would overwrite a saved design that happened to load first.
  const designIdParam = searchParams?.get("designId");
  useEffect(() => {
    if (!product) return;
    setViewsLoading(true);

    const viewsPromise = fetch(`/api/products/${product.id}/views`).then((r) => r.json());
    const designPromise = designIdParam
      ? fetch(`/api/designs/${designIdParam}`).then((r) => r.json())
      : Promise.resolve(null);

    Promise.all([viewsPromise, designPromise])
      .then(([viewJson, designJson]) => {
        // Build base view map from product views
        const views: ProductView[] = viewJson?.data ?? [];
        setProductViews(views);

        const initial: Record<string, ViewDesignState> = {};
        let activeKey = "default";

        if (views.length > 0) {
          const defaultView = views.find((v) => v.isDefault) ?? views[0];
          activeKey = defaultView.viewKey;
          views.forEach((v) => { initial[v.viewKey] = { ...DEFAULT_VIEW_DESIGN }; });
        } else {
          initial.default = { ...DEFAULT_VIEW_DESIGN };
        }

        // Merge saved design on top — no race condition possible
        const d = designJson?.data;
        if (d && d.productId === product.id) {
          if (d.name) setDesignName(d.name);
          setExistingDesignId(d.id);
          if (d.designData) {
            try {
              const parsed = JSON.parse(d.designData) as Record<string, unknown>;
              if (parsed.version === "3" && parsed.views && typeof parsed.views === "object") {
                Object.entries(parsed.views as Record<string, ViewDesignState>).forEach(([key, viewState]) => {
                  initial[key] = viewState;
                });
              }
            } catch { /* malformed — start fresh */ }
          }
          toast.info("Design loaded — continue where you left off!", { autoClose: 3000 });
        }

        setActiveViewKey(activeKey);
        setViewDesigns(initial);
      })
      .catch(() => {
        setActiveViewKey("default");
        setViewDesigns({ default: { ...DEFAULT_VIEW_DESIGN } });
      })
      .finally(() => setViewsLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product, designIdParam]);

  // â”€â”€ Auto-save every 90 seconds â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  useEffect(() => {
    if (!product || !existingDesignId) return;
    const timer = setInterval(async () => {
      try {
        const payload: MultiViewDesignData = { version: "3", views: viewDesigns };
        const res = await fetch(`/api/designs/${existingDesignId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: designName, designData: JSON.stringify(payload) }),
        });
        if (res.ok) setLastSaved(new Date());
      } catch { /* silent auto-save fail */ }
    }, 90000);
    return () => clearInterval(timer);
  }, [product, existingDesignId, viewDesigns, designName]);

  // â”€â”€ Keyboard shortcuts â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      const isInput = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
      if (isInput) return;

      const ctrl = e.ctrlKey || e.metaKey;

      if (ctrl && e.key === "z") { e.preventDefault(); undo(); return; }
      if (ctrl && (e.key === "y" || (e.shiftKey && e.key === "Z"))) { e.preventDefault(); redo(); return; }
      if (ctrl && e.key === "d" && selectedElementId) { e.preventDefault(); duplicateElement(selectedElementId); return; }
      if (ctrl && e.key === "c" && selectedElement) { e.preventDefault(); setClipboard({ ...selectedElement, id: generateId() }); toast.info("Element copied", { autoClose: 1200 }); return; }
      if (ctrl && e.key === "v" && clipboard) { e.preventDefault(); pasteFromClipboard(); return; }

      if ((e.key === "Delete" || e.key === "Backspace") && selectedElementId) {
        e.preventDefault();
        deleteElement(selectedElementId);
        return;
      }
      if (e.key === "Escape") { setSelectedElementId(null); return; }

      // Arrow key nudge
      if (selectedElementId && ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault();
        const step = e.shiftKey ? 1 : 10;
        const dx = e.key === "ArrowLeft" ? -step : e.key === "ArrowRight" ? step : 0;
        const dy = e.key === "ArrowUp" ? -step : e.key === "ArrowDown" ? step : 0;
        updateDesign((prev) => ({
          ...prev,
          elements: prev.elements.map((el) =>
            el.id === selectedElementId ? { ...el, x: el.x + dx, y: el.y + dy } as DesignElement : el
          ),
        }));
        return;
      }

      // Layer shortcuts
      if (selectedElementId) {
        if (e.key === "]") { e.preventDefault(); bringForward(selectedElementId); }
        if (e.key === "[") { e.preventDefault(); sendBackward(selectedElementId); }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedElementId, selectedElement, clipboard, undo, redo]);

  // â”€â”€ Switch active view â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const switchView = (viewKey: string) => {
    if (viewKey === activeViewKey) return;
    setSelectedElementId(null);
    setActiveTool("select");
    setActiveViewKey(viewKey);
  };

  // â”€â”€ Element operations â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const addTextElement = () => {
    const id = generateId();
    updateDesign((prev) => ({
      ...prev,
      elements: [...prev.elements, {
        type: "text", id,
        x: prev.canvasWidth / 2, y: prev.canvasHeight / 2,
        width: 220, height: 48,
        text: "Your Text Here",
        fontFamily: "Inter", fontSize: 24,
        fontWeight: "normal", fontStyle: "normal",
        textAlign: "center", color: "#1a1a1a",
        rotation: 0, opacity: 1, locked: false,
        letterSpacing: 0, lineHeight: 1.3,
        textDecoration: "none", textTransform: "none",
        strokeColor: "transparent", strokeWidth: 0,
      } as TextElement],
    }));
    setSelectedElementId(id);
    setActiveTool("select");
  };

  const addImageElement = (src: string) => {
    const id = generateId();
    updateDesign((prev) => ({
      ...prev,
      elements: [...prev.elements, {
        type: "image", id,
        x: prev.canvasWidth / 2, y: prev.canvasHeight / 2,
        width: 160, height: 160, src, rotation: 0,
        opacity: 1, locked: false,
        flipX: false, flipY: false,
        borderRadius: 0, brightness: 100, contrast: 100, grayscale: false,
      } as ImageElement],
    }));
    setSelectedElementId(id);
    setActiveTool("select");
  };

  const addQRElement = (data: string) => {
    const id = generateId();
    updateDesign((prev) => ({
      ...prev,
      elements: [...prev.elements, {
        type: "qr", id,
        x: prev.canvasWidth / 2, y: prev.canvasHeight / 2,
        width: 110, height: 110, data,
        color: "#1a1a1a", bgColor: qrBgColor,
        rotation: 0, opacity: 1, locked: false,
      } as QRElement],
    }));
    setSelectedElementId(id);
    setActiveTool("select");
  };

  const addShapeElement = () => {
    const id = generateId();
    updateDesign((prev) => ({
      ...prev,
      elements: [...prev.elements, {
        type: "shape", id,
        x: prev.canvasWidth / 2, y: prev.canvasHeight / 2,
        width: 160, height: shapeType === "circle" ? 160 : 120,
        shape: shapeType, fillColor: shapeFill,
        strokeColor: shapeStroke, strokeWidth: shapeStrokeWidth,
        rx: shapeRx, rotation: 0, opacity: 1, locked: false,
      } as ShapeElement],
    }));
    setSelectedElementId(id);
    setActiveTool("select");
  };

  const updateElement = (id: string, updates: Partial<DesignElement>) => {
    updateDesign((prev) => ({
      ...prev,
      elements: prev.elements.map((el) => el.id === id ? ({ ...el, ...updates } as DesignElement) : el),
    }));
  };

  const deleteElement = (id: string) => {
    updateDesign((prev) => ({ ...prev, elements: prev.elements.filter((el) => el.id !== id) }));
    setSelectedElementId(null);
  };

  const duplicateElement = (id: string) => {
    const el = currentDesign.elements.find((e) => e.id === id);
    if (!el) return;
    const newId = generateId();
    updateDesign((prev) => ({
      ...prev,
      elements: [...prev.elements, { ...el, id: newId, x: el.x + 24, y: el.y + 24 }],
    }));
    setSelectedElementId(newId);
  };

  const pasteFromClipboard = () => {
    if (!clipboard) return;
    const newId = generateId();
    const pasted = { ...clipboard, id: newId, x: clipboard.x + 24, y: clipboard.y + 24 };
    updateDesign((prev) => ({ ...prev, elements: [...prev.elements, pasted] }));
    setSelectedElementId(newId);
    toast.info("Element pasted", { autoClose: 1200 });
  };

  // â”€â”€ Layer order â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const bringForward = (id: string) => {
    updateDesign((prev) => {
      const idx = prev.elements.findIndex((e) => e.id === id);
      if (idx < prev.elements.length - 1) {
        const els = [...prev.elements];
        [els[idx], els[idx + 1]] = [els[idx + 1], els[idx]];
        return { ...prev, elements: els };
      }
      return prev;
    });
  };

  const sendBackward = (id: string) => {
    updateDesign((prev) => {
      const idx = prev.elements.findIndex((e) => e.id === id);
      if (idx > 0) {
        const els = [...prev.elements];
        [els[idx], els[idx - 1]] = [els[idx - 1], els[idx]];
        return { ...prev, elements: els };
      }
      return prev;
    });
  };

  const bringToFront = (id: string) => {
    updateDesign((prev) => {
      const el = prev.elements.find((e) => e.id === id);
      if (!el) return prev;
      return { ...prev, elements: [...prev.elements.filter((e) => e.id !== id), el] };
    });
  };

  const sendToBack = (id: string) => {
    updateDesign((prev) => {
      const el = prev.elements.find((e) => e.id === id);
      if (!el) return prev;
      return { ...prev, elements: [el, ...prev.elements.filter((e) => e.id !== id)] };
    });
  };

  // â”€â”€ Element alignment to canvas â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const alignElement = (id: string, alignment: "left" | "centerH" | "right" | "top" | "centerV" | "bottom") => {
    const el = currentDesign.elements.find((e) => e.id === id);
    if (!el) return;
    const cw = currentDesign.canvasWidth;
    const ch = currentDesign.canvasHeight;
    let x = el.x, y = el.y;
    if (alignment === "left") x = el.width / 2;
    if (alignment === "centerH") x = cw / 2;
    if (alignment === "right") x = cw - el.width / 2;
    if (alignment === "top") y = el.height / 2;
    if (alignment === "centerV") y = ch / 2;
    if (alignment === "bottom") y = ch - el.height / 2;
    updateElement(id, { x, y } as Partial<DesignElement>);
  };

  // â”€â”€ Copy current view design to all views â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const copyDesignToAllViews = () => {
    const current = viewDesigns[activeViewKey] ?? DEFAULT_VIEW_DESIGN;
    const newViews: Record<string, ViewDesignState> = {};
    Object.keys(viewDesigns).forEach((key) => {
      newViews[key] = key === activeViewKey ? current : {
        ...current,
        elements: current.elements.map((el) => ({ ...el, id: generateId() })),
      };
    });
    setViewDesigns(newViews);
    toast.success("Design copied to all views!");
  };

  // â”€â”€ Clear current view â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const clearCurrentView = () => {
    if (!confirm("Clear all elements on this view?")) return;
    updateDesign(() => ({ ...DEFAULT_VIEW_DESIGN }));
    setSelectedElementId(null);
  };

  // â”€â”€ File upload â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = ["image/png", "image/jpeg", "image/svg+xml", "image/webp"];
    if (!allowed.includes(file.type)) { toast.error("Please upload PNG, JPEG, SVG, or WebP"); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error("File size must be under 5MB"); return; }
    const reader = new FileReader();
    reader.onload = () => { if (typeof reader.result === "string") addImageElement(reader.result); };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // â”€â”€ Template apply â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const applyTemplate = (template: (typeof TEMPLATES)[number]) => {
    const newDesign: ViewDesignState = {
      ...currentDesign,
      elements: template.elements.map((el) => ({ ...el, id: generateId() })),
      backgroundColor: template.backgroundColor,
    };
    setViewDesigns((prev) => ({ ...prev, [activeViewKey]: newDesign }));
    pushHistory(activeViewKey, newDesign);
    setSelectedElementId(null);
    setActiveTool("select");
    toast.success(`Template "${template.name}" applied`);
  };

  // ── Generate SVG thumbnail from the active view ───────────────────────────
  const generateThumbnail = useCallback((vd: Record<string, ViewDesignState>, viewKey: string): string => {
    const ad = vd[viewKey];
    const tw = 300, th = 300;
    const cw = (ad as { canvasWidth?: number })?.canvasWidth ?? 600;
    const ch = (ad as { canvasHeight?: number })?.canvasHeight ?? 600;
    const scaleX = tw / cw;
    const scaleY = th / ch;
    const bg = (ad as { backgroundColor?: string })?.backgroundColor ?? "#ffffff";
    const elems: DesignElement[] = (ad as { elements?: DesignElement[] })?.elements ?? [];
    const escXml = (s: string) =>
      s.replace(/[<>&"']/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&#39;" }[c] ?? c));
    const shapeSvg = elems
      .filter((e): e is ShapeElement => e.type === "shape").slice(0, 5)
      .map((e) => {
        const x = Math.round((e.x - e.width / 2) * scaleX);
        const y = Math.round((e.y - e.height / 2) * scaleY);
        return `<rect x="${x}" y="${y}" width="${Math.max(1, Math.round(e.width * scaleX))}" height="${Math.max(1, Math.round(e.height * scaleY))}" fill="${e.fillColor}" opacity="${e.opacity}"/>`;
      }).join("");
    const textSvg = elems
      .filter((e): e is TextElement => e.type === "text").slice(0, 5)
      .map((e) => {
        const fs = Math.max(6, Math.round(e.fontSize * Math.min(scaleX, scaleY)));
        return `<text x="${Math.round(e.x * scaleX)}" y="${Math.round(e.y * scaleY)}" font-family="sans-serif" font-size="${fs}" fill="${e.color}" text-anchor="middle" opacity="${e.opacity}">${escXml(e.text.slice(0, 30))}</text>`;
      }).join("");
    const svgStr = `<svg xmlns="http://www.w3.org/2000/svg" width="${tw}" height="${th}" viewBox="0 0 ${tw} ${th}"><rect width="${tw}" height="${th}" fill="${bg}"/>${shapeSvg}${textSvg}</svg>`;
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgStr)}`;
  }, []);

  // â”€â”€ Save design â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const saveDesign = async (): Promise<string | null> => {
    if (!product) return null;
    setSaving(true);
    try {
      const payload: MultiViewDesignData = { version: "3", views: viewDesigns };
      const thumbnailDataUrl = generateThumbnail(viewDesigns, activeViewKey);
      const url = existingDesignId ? `/api/designs/${existingDesignId}` : "/api/designs";
      const method = existingDesignId ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, name: designName, designData: JSON.stringify(payload), thumbnailUrl: thumbnailDataUrl }),
      });
      if (!res.ok) {
        if (res.status === 401) throw new Error("Please sign in to save your design.");
        const j = await res.json();
        throw new Error(j.message ?? "Failed to save");
      }
      const json = await res.json();
      const savedId = json?.data?.id ?? existingDesignId;
      if (!existingDesignId && json?.data?.id) setExistingDesignId(json.data.id);
      setLastSaved(new Date());
      toast.success("Design saved as draft!");
      return savedId;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save design");
      return existingDesignId;
    } finally {
      setSaving(false);
    }
  };

  // â”€â”€ Add to cart â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handleAddToCart = async () => {
    if (!product) return;
    setAddingToCart(true);
    try {
      // Auto-save the design if it hasn't been saved yet
      let finalDesignId = existingDesignId;
      if (!finalDesignId) {
        finalDesignId = await saveDesign();
      }

      // Generate thumbnail using shared helper
      const designThumbnail = generateThumbnail(viewDesigns, activeViewKey);

      // Add to Redux cart with all custom-print details
      const mainImg = product.images?.find((i: { isMain: boolean }) => i.isMain) ?? product.images?.[0];
      const printPrice = product.allowCustomPrint ? Number(product.printPrice ?? 0) : 0;
      addToCartDispatch({
        id: product.id,
        name: product.name,
        image: mainImg?.url ?? "",
        price: product.price + printPrice,
        quantity,
        slug: product.slug,
        designThumbnail,
        customPrint: product.allowCustomPrint ?? false,
        printPrice,
        designId: finalDesignId ?? undefined,
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add to cart");
    } finally {
      setAddingToCart(false);
    }
  };

  // â”€â”€ Canvas drag handling â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const SNAP_THRESHOLD = 12;

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;
    for (let i = currentDesign.elements.length - 1; i >= 0; i--) {
      const el = currentDesign.elements[i];
      if ((el as TextElement).locked) continue;
      if (x >= el.x - el.width / 2 && x <= el.x + el.width / 2 && y >= el.y - el.height / 2 && y <= el.y + el.height / 2) {
        setSelectedElementId(el.id);
        setDragging({ elementId: el.id, offsetX: x - el.x, offsetY: y - el.y });
        return;
      }
    }
    setSelectedElementId(null);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (!dragging || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    let x = (e.clientX - rect.left) / zoom - dragging.offsetX;
    let y = (e.clientY - rect.top) / zoom - dragging.offsetY;
    const cw = currentDesign.canvasWidth;
    const ch = currentDesign.canvasHeight;
    // Snap to center
    const snapX = Math.abs(x - cw / 2) < SNAP_THRESHOLD;
    const snapY = Math.abs(y - ch / 2) < SNAP_THRESHOLD;
    if (snapX) x = cw / 2;
    if (snapY) y = ch / 2;
    setSnapIndicator({ x: snapX, y: snapY });
    setViewDesigns((prev) => ({
      ...prev,
      [activeViewKey]: {
        ...(prev[activeViewKey] ?? DEFAULT_VIEW_DESIGN),
        elements: (prev[activeViewKey]?.elements ?? []).map((el) =>
          el.id === dragging.elementId ? ({ ...el, x, y } as DesignElement) : el
        ),
      },
    }));
  };

  const handleCanvasMouseUp = () => {
    if (dragging) { pushHistory(activeViewKey, currentDesign); setDragging(null); }
    setSnapIndicator({ x: false, y: false });
  };

  const handleCanvasTouchStart = (e: React.TouchEvent) => {
    if (!canvasRef.current || e.touches.length !== 1) return;
    const touch = e.touches[0];
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (touch.clientX - rect.left) / zoom;
    const y = (touch.clientY - rect.top) / zoom;
    for (let i = currentDesign.elements.length - 1; i >= 0; i--) {
      const el = currentDesign.elements[i];
      if ((el as TextElement).locked) continue;
      if (x >= el.x - el.width / 2 && x <= el.x + el.width / 2 && y >= el.y - el.height / 2 && y <= el.y + el.height / 2) {
        setSelectedElementId(el.id);
        setDragging({ elementId: el.id, offsetX: x - el.x, offsetY: y - el.y });
        return;
      }
    }
    setSelectedElementId(null);
  };

  const handleCanvasTouchMove = (e: React.TouchEvent) => {
    if (!dragging || !canvasRef.current || e.touches.length !== 1) return;
    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (touch.clientX - rect.left) / zoom - dragging.offsetX;
    const y = (touch.clientY - rect.top) / zoom - dragging.offsetY;
    setViewDesigns((prev) => ({
      ...prev,
      [activeViewKey]: {
        ...(prev[activeViewKey] ?? DEFAULT_VIEW_DESIGN),
        elements: (prev[activeViewKey]?.elements ?? []).map((el) =>
          el.id === dragging.elementId ? ({ ...el, x, y } as DesignElement) : el
        ),
      },
    }));
  };

  const handleCanvasTouchEnd = () => {
    if (dragging) { pushHistory(activeViewKey, currentDesign); setDragging(null); }
  };

  // â”€â”€ Mobile panel â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handleMobileToolClick = (toolId: ToolType) => {
    if (activeTool === toolId && mobilePanelOpenState) setMobilePanelOpenState(false);
    else { setActiveTool(toolId); setMobilePanelOpenState(true); }
  };

  // â”€â”€ Auto-fit zoom on mobile â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        const fitZoom = Math.min((window.innerWidth - 32) / currentDesign.canvasWidth, 1);
        setZoom(Math.round(fitZoom * 100) / 100);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDesign.canvasWidth]);

  // â”€â”€ Loading / error â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (loading || viewsLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Loading editor…</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-bold text-foreground">Product Not Found</h1>
        <Link href="/products" className="text-primary mt-4 inline-block">Back to Products</Link>
      </div>
    );
  }

  const mainImage = product.images?.length > 0
    ? product.images.sort((a: { isMain: boolean; sortOrder: number }, b: { isMain: boolean; sortOrder: number }) =>
        a.isMain ? -1 : b.isMain ? 1 : a.sortOrder - b.sortOrder
      )[0]
    : null;

  const activeView = productViews.find((v) => v.viewKey === activeViewKey) ?? null;
  const baseImageUrl = activeView?.baseImageUrl ?? mainImage?.url ?? null;

  const canUndo = (historyIndexRef.current[activeViewKey] ?? 0) > 0;
  const canRedo = (historyIndexRef.current[activeViewKey] ?? 0) < ((historyRef.current[activeViewKey]?.length ?? 1) - 1);

  const editedViews = new Set(
    Object.entries(viewDesigns)
      .filter(([, d]) => d.elements.length > 0 || d.backgroundColor !== "#ffffff")
      .map(([k]) => k)
  );

  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // TOOL PANEL
  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const renderToolPanel = () => {
    switch (activeTool) {

      // â”€â”€ TEXT â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      case "text":
        return (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Text</h3>
            <button onClick={addTextElement} className="w-full h-10 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition flex items-center justify-center gap-2">
              <Type size={15} /> Add Text Block
            </button>

            {selectedElement?.type === "text" && (
              <div className="space-y-3 pt-3 border-t border-border">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Edit Text</h4>

                {/* Text content */}
                <textarea
                  value={selectedElement.text}
                  onChange={(e) => updateElement(selectedElement.id, { text: e.target.value })}
                  className="w-full h-20 bg-muted border border-border rounded-lg p-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                />

                {/* Font family */}
                <select
                  value={selectedElement.fontFamily}
                  onChange={(e) => updateElement(selectedElement.id, { fontFamily: e.target.value })}
                  className="w-full h-9 bg-muted border border-border rounded-lg px-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {FONT_FAMILIES.map((f) => <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>)}
                </select>

                {/* Font size + style */}
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={selectedElement.fontSize}
                    onChange={(e) => updateElement(selectedElement.id, { fontSize: Number(e.target.value) })}
                    min={6} max={150}
                    className="w-20 h-9 bg-muted border border-border rounded-lg px-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button onClick={() => updateElement(selectedElement.id, { fontWeight: selectedElement.fontWeight === "bold" ? "normal" : "bold" })}
                    className={`w-9 h-9 rounded-lg flex items-center justify-center transition ${selectedElement.fontWeight === "bold" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
                    <Bold size={14} />
                  </button>
                  <button onClick={() => updateElement(selectedElement.id, { fontStyle: selectedElement.fontStyle === "italic" ? "normal" : "italic" })}
                    className={`w-9 h-9 rounded-lg flex items-center justify-center transition ${selectedElement.fontStyle === "italic" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
                    <Italic size={14} />
                  </button>
                  <button onClick={() => updateElement(selectedElement.id, { textDecoration: selectedElement.textDecoration === "underline" ? "none" : "underline" })}
                    className={`w-9 h-9 rounded-lg flex items-center justify-center transition ${selectedElement.textDecoration === "underline" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
                    <Underline size={14} />
                  </button>
                  <button onClick={() => updateElement(selectedElement.id, { textDecoration: selectedElement.textDecoration === "line-through" ? "none" : "line-through" })}
                    className={`w-9 h-9 rounded-lg flex items-center justify-center transition ${selectedElement.textDecoration === "line-through" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
                    <Strikethrough size={14} />
                  </button>
                </div>

                {/* Text alignment */}
                <div className="flex gap-1">
                  {(["left", "center", "right"] as const).map((align) => (
                    <button key={align} onClick={() => updateElement(selectedElement.id, { textAlign: align })}
                      className={`flex-1 h-9 rounded-lg flex items-center justify-center transition ${selectedElement.textAlign === align ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
                      {align === "left" ? <AlignLeft size={14} /> : align === "center" ? <AlignCenter size={14} /> : <AlignRight size={14} />}
                    </button>
                  ))}
                </div>

                {/* Text transform */}
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Transform</label>
                  <div className="grid grid-cols-4 gap-1">
                    {(["none", "uppercase", "lowercase", "capitalize"] as const).map((t) => (
                      <button key={t} onClick={() => updateElement(selectedElement.id, { textTransform: t })}
                        className={`h-7 rounded text-[10px] font-medium transition ${selectedElement.textTransform === t ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
                        {t === "none" ? "Ab" : t === "uppercase" ? "AB" : t === "lowercase" ? "ab" : "Ab..."}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Letter spacing + line height */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-muted-foreground">Spacing</label>
                    <input type="range" min={-2} max={20} step={0.5}
                      value={selectedElement.letterSpacing}
                      onChange={(e) => updateElement(selectedElement.id, { letterSpacing: Number(e.target.value) })}
                      className="w-full accent-primary" />
                    <span className="text-[10px] text-muted-foreground">{selectedElement.letterSpacing}px</span>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Line H</label>
                    <input type="range" min={0.8} max={3} step={0.1}
                      value={selectedElement.lineHeight}
                      onChange={(e) => updateElement(selectedElement.id, { lineHeight: Number(e.target.value) })}
                      className="w-full accent-primary" />
                    <span className="text-[10px] text-muted-foreground">{selectedElement.lineHeight}</span>
                  </div>
                </div>

                {/* Color */}
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block">Color</label>
                  <div className="flex flex-wrap gap-1.5">
                    {COLORS.slice(0, 18).map((color) => (
                      <button key={color} onClick={() => updateElement(selectedElement.id, { color })}
                        className={`w-6 h-6 rounded border-2 transition ${selectedElement.color === color ? "border-primary scale-110" : "border-border"}`}
                        style={{ backgroundColor: color }} />
                    ))}
                    <input type="color" value={selectedElement.color}
                      onChange={(e) => updateElement(selectedElement.id, { color: e.target.value })}
                      className="w-6 h-6 rounded border border-border cursor-pointer" title="Custom color" />
                  </div>
                </div>

                {/* Stroke */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Outline color</label>
                    <div className="flex items-center gap-1.5">
                      <input type="color" value={selectedElement.strokeColor === "transparent" ? "#000000" : selectedElement.strokeColor}
                        onChange={(e) => updateElement(selectedElement.id, { strokeColor: e.target.value })}
                        className="w-7 h-7 rounded cursor-pointer border border-border" />
                      <button onClick={() => updateElement(selectedElement.id, { strokeColor: "transparent" })}
                        className="text-[10px] text-muted-foreground hover:text-foreground">None</button>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Width</label>
                    <input type="number" min={0} max={10} value={selectedElement.strokeWidth}
                      onChange={(e) => updateElement(selectedElement.id, { strokeWidth: Number(e.target.value) })}
                      className="w-full h-8 bg-muted border border-border rounded-lg px-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                </div>

                {/* Opacity */}
                <div>
                  <label className="text-xs text-muted-foreground">Opacity: {Math.round(selectedElement.opacity * 100)}%</label>
                  <input type="range" min={0} max={1} step={0.01}
                    value={selectedElement.opacity}
                    onChange={(e) => updateElement(selectedElement.id, { opacity: Number(e.target.value) })}
                    className="w-full accent-primary" />
                </div>

                {/* Rotation */}
                <div>
                  <label className="text-xs text-muted-foreground">Rotation: {selectedElement.rotation}Â°</label>
                  <input type="range" min={0} max={360}
                    value={selectedElement.rotation}
                    onChange={(e) => updateElement(selectedElement.id, { rotation: Number(e.target.value) })}
                    className="w-full accent-primary" />
                </div>
              </div>
            )}
          </div>
        );

      // â”€â”€ IMAGE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      case "image":
        return (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Upload Logo / Image</h3>
            <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/svg+xml,image/webp" className="hidden" onChange={handleFileUpload} />
            <button onClick={() => fileInputRef.current?.click()}
              className="w-full h-24 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary hover:text-primary transition cursor-pointer">
              <Upload size={24} />
              <span className="text-xs text-center">PNG, JPEG, SVG, WebP<br />(max 5 MB)</span>
            </button>

            {selectedElement?.type === "image" && (
              <div className="space-y-3 pt-3 border-t border-border">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Image Options</h4>

                {/* Dimensions */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-muted-foreground">Width</label>
                    <input type="number" value={Math.round(selectedElement.width)} min={20}
                      onChange={(e) => updateElement(selectedElement.id, { width: Number(e.target.value) })}
                      className="w-full h-8 bg-muted border border-border rounded-lg px-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Height</label>
                    <input type="number" value={Math.round(selectedElement.height)} min={20}
                      onChange={(e) => updateElement(selectedElement.id, { height: Number(e.target.value) })}
                      className="w-full h-8 bg-muted border border-border rounded-lg px-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                </div>

                {/* Flip */}
                <div className="flex gap-2">
                  <button onClick={() => updateElement(selectedElement.id, { flipX: !selectedElement.flipX })}
                    className={`flex-1 h-9 text-xs rounded-lg font-medium transition flex items-center justify-center gap-1 ${selectedElement.flipX ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
                    â†” Flip H
                  </button>
                  <button onClick={() => updateElement(selectedElement.id, { flipY: !selectedElement.flipY })}
                    className={`flex-1 h-9 text-xs rounded-lg font-medium transition flex items-center justify-center gap-1 ${selectedElement.flipY ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
                    â†• Flip V
                  </button>
                </div>

                {/* Border radius */}
                <div>
                  <label className="text-xs text-muted-foreground">Corner radius: {selectedElement.borderRadius}px</label>
                  <input type="range" min={0} max={50} value={selectedElement.borderRadius}
                    onChange={(e) => updateElement(selectedElement.id, { borderRadius: Number(e.target.value) })}
                    className="w-full accent-primary" />
                </div>

                {/* Filters */}
                <div>
                  <label className="text-xs text-muted-foreground">Brightness: {selectedElement.brightness}%</label>
                  <input type="range" min={0} max={200} value={selectedElement.brightness}
                    onChange={(e) => updateElement(selectedElement.id, { brightness: Number(e.target.value) })}
                    className="w-full accent-primary" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Contrast: {selectedElement.contrast}%</label>
                  <input type="range" min={0} max={200} value={selectedElement.contrast}
                    onChange={(e) => updateElement(selectedElement.id, { contrast: Number(e.target.value) })}
                    className="w-full accent-primary" />
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="gs" checked={selectedElement.grayscale}
                    onChange={(e) => updateElement(selectedElement.id, { grayscale: e.target.checked })}
                    className="accent-primary" />
                  <label htmlFor="gs" className="text-xs text-muted-foreground cursor-pointer">Grayscale</label>
                </div>

                {/* Opacity */}
                <div>
                  <label className="text-xs text-muted-foreground">Opacity: {Math.round(selectedElement.opacity * 100)}%</label>
                  <input type="range" min={0} max={1} step={0.01} value={selectedElement.opacity}
                    onChange={(e) => updateElement(selectedElement.id, { opacity: Number(e.target.value) })}
                    className="w-full accent-primary" />
                </div>

                {/* Rotation */}
                <div>
                  <label className="text-xs text-muted-foreground">Rotation: {selectedElement.rotation}Â°</label>
                  <input type="range" min={0} max={360} value={selectedElement.rotation}
                    onChange={(e) => updateElement(selectedElement.id, { rotation: Number(e.target.value) })}
                    className="w-full accent-primary" />
                </div>
              </div>
            )}
          </div>
        );

      // â”€â”€ COLOR â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      case "color":
        return (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Canvas Background</h3>
            <p className="text-xs text-muted-foreground">
              Changes the <span className="font-semibold text-foreground">{activeView?.name ?? "current"}</span> view background only.
            </p>

            {/* Solid colour */}
            <div>
              <label className="text-xs text-muted-foreground mb-2 block">Solid Color</label>
              <div className="flex flex-wrap gap-2">
                {COLORS.map((color) => (
                  <button key={color} onClick={() => updateDesign((prev) => ({ ...prev, backgroundColor: color, backgroundGradient: null }))}
                    className={`w-7 h-7 rounded-lg border-2 transition ${currentDesign.backgroundColor === color && !currentDesign.backgroundGradient ? "border-primary scale-110 shadow-md" : "border-border"}`}
                    style={{ backgroundColor: color }} />
                ))}
              </div>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Custom:</span>
                <input type="color" value={currentDesign.backgroundColor}
                  onChange={(e) => updateDesign((prev) => ({ ...prev, backgroundColor: e.target.value, backgroundGradient: null }))}
                  className="w-8 h-8 rounded cursor-pointer border border-border" />
                <span className="text-xs text-muted-foreground font-mono">{currentDesign.backgroundColor}</span>
              </div>
            </div>

            {/* Gradient */}
            <div>
              <label className="text-xs text-muted-foreground mb-2 block">Gradient</label>
              <div className="grid grid-cols-3 gap-2">
                {GRADIENTS.map((g) => (
                  <button key={g.id} onClick={() => updateDesign((prev) => ({ ...prev, backgroundGradient: g.value }))}
                    className={`h-10 rounded-lg border-2 text-xs font-medium transition ${currentDesign.backgroundGradient === g.value ? "border-primary" : "border-border"}`}
                    style={{ background: g.value ?? currentDesign.backgroundColor }}>
                    <span className={`${g.value ? "text-white drop-shadow-sm" : "text-muted-foreground"} text-[10px]`}>{g.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Pattern */}
            <div>
              <label className="text-xs text-muted-foreground mb-2 block">Pattern overlay</label>
              <div className="grid grid-cols-2 gap-2">
                {PATTERNS.map((p) => (
                  <button key={p.id}
                    onClick={() => updateDesign((prev) => ({ ...prev, backgroundPattern: p.id === "none" ? null : p.id }))}
                    className={`h-9 rounded-lg text-xs font-medium transition ${(currentDesign.backgroundPattern ?? "none") === p.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
                    {p.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Opacity for bg */}
            <button onClick={clearCurrentView}
              className="w-full h-9 flex items-center justify-center gap-2 text-xs text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition">
              <RotateCcw size={13} /> Reset this view
            </button>
          </div>
        );

      // â”€â”€ QR CODE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      case "qr":
        return (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">QR Code</h3>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">URL or Text</label>
              <input type="text" value={qrInput} onChange={(e) => setQrInput(e.target.value)}
                placeholder="https://example.com"
                className="w-full h-9 bg-muted border border-border rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>

            {/* Colors */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">QR Color</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={selectedElement?.type === "qr" ? selectedElement.color : "#1a1a1a"}
                    onChange={(e) => { if (selectedElement?.type === "qr") updateElement(selectedElement.id, { color: e.target.value }); }}
                    className="w-8 h-8 rounded cursor-pointer border border-border" />
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Background</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={qrBgColor}
                    onChange={(e) => { setQrBgColor(e.target.value); if (selectedElement?.type === "qr") updateElement(selectedElement.id, { bgColor: e.target.value }); }}
                    className="w-8 h-8 rounded cursor-pointer border border-border" />
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="flex items-center justify-center p-4 bg-muted rounded-xl">
              <QRCodeSVG data={qrInput || "https://pac8.store"} color="#1a1a1a" bgColor={qrBgColor} size={120} />
            </div>

            <button onClick={() => addQRElement(qrInput || "https://pac8.store")} disabled={!qrInput}
              className="w-full h-10 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition disabled:opacity-50">
              Add QR Code to Canvas
            </button>

            {selectedElement?.type === "qr" && (
              <div className="space-y-3 pt-3 border-t border-border">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">QR Settings</h4>
                <div>
                  <label className="text-xs text-muted-foreground">Size: {Math.round(selectedElement.width)}px</label>
                  <input type="range" min={60} max={250} value={selectedElement.width}
                    onChange={(e) => { const s = Number(e.target.value); updateElement(selectedElement.id, { width: s, height: s }); }}
                    className="w-full accent-primary" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Opacity: {Math.round(selectedElement.opacity * 100)}%</label>
                  <input type="range" min={0} max={1} step={0.01} value={selectedElement.opacity}
                    onChange={(e) => updateElement(selectedElement.id, { opacity: Number(e.target.value) })}
                    className="w-full accent-primary" />
                </div>
              </div>
            )}
          </div>
        );

      // â”€â”€ SHAPES â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      case "shapes":
        return (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Shapes</h3>

            {/* Shape type */}
            <div>
              <label className="text-xs text-muted-foreground mb-2 block">Shape</label>
              <div className="grid grid-cols-3 gap-2">
                {([
                  { t: "rectangle" as ShapeType, label: "Rect" },
                  { t: "circle" as ShapeType, label: "Circle" },
                  { t: "triangle" as ShapeType, label: "Triangle" },
                  { t: "diamond" as ShapeType, label: "Diamond" },
                  { t: "star" as ShapeType, label: "Star" },
                ]).map(({ t, label }) => (
                  <button key={t} onClick={() => setShapeType(t)}
                    className={`h-10 rounded-lg text-xs font-medium transition border ${shapeType === t ? "bg-primary text-primary-foreground border-primary" : "bg-muted text-muted-foreground border-border hover:border-primary"}`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Fill color */}
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Fill Color</label>
              <div className="flex flex-wrap gap-1.5">
                {COLORS.slice(0, 18).map((c) => (
                  <button key={c} onClick={() => setShapeFill(c)}
                    className={`w-6 h-6 rounded border-2 transition ${shapeFill === c ? "border-primary scale-110" : "border-border"}`}
                    style={{ backgroundColor: c }} />
                ))}
                <input type="color" value={shapeFill} onChange={(e) => setShapeFill(e.target.value)}
                  className="w-6 h-6 rounded cursor-pointer border border-border" />
              </div>
            </div>

            {/* Stroke */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Stroke color</label>
                <div className="flex items-center gap-1">
                  <input type="color" value={shapeStroke === "transparent" ? "#1a1a1a" : shapeStroke}
                    onChange={(e) => setShapeStroke(e.target.value)}
                    className="w-8 h-8 rounded cursor-pointer border border-border" />
                  <button onClick={() => setShapeStroke("transparent")}
                    className="text-[10px] text-muted-foreground hover:text-foreground">None</button>
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Width</label>
                <input type="number" min={0} max={20} value={shapeStrokeWidth}
                  onChange={(e) => setShapeStrokeWidth(Number(e.target.value))}
                  className="w-full h-9 bg-muted border border-border rounded-lg px-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
            </div>

            {shapeType === "rectangle" && (
              <div>
                <label className="text-xs text-muted-foreground">Corner radius: {shapeRx}px</label>
                <input type="range" min={0} max={80} value={shapeRx}
                  onChange={(e) => setShapeRx(Number(e.target.value))}
                  className="w-full accent-primary" />
              </div>
            )}

            {/* Preview + Add */}
            <div className="flex items-center justify-center p-4 bg-muted rounded-xl">
              <ShapeSVG shape={shapeType} width={100} height={shapeType === "circle" ? 100 : 75} fillColor={shapeFill} strokeColor={shapeStroke} strokeWidth={shapeStrokeWidth} rx={shapeRx} />
            </div>
            <button onClick={addShapeElement}
              className="w-full h-10 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition flex items-center justify-center gap-2">
              <Plus size={15} /> Add Shape
            </button>

            {/* Selected shape editing */}
            {selectedElement?.type === "shape" && (
              <div className="space-y-3 pt-3 border-t border-border">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Edit Shape</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-muted-foreground">Width</label>
                    <input type="number" min={10} value={Math.round(selectedElement.width)}
                      onChange={(e) => updateElement(selectedElement.id, { width: Number(e.target.value) })}
                      className="w-full h-8 bg-muted border border-border rounded-lg px-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Height</label>
                    <input type="number" min={10} value={Math.round(selectedElement.height)}
                      onChange={(e) => updateElement(selectedElement.id, { height: Number(e.target.value) })}
                      className="w-full h-8 bg-muted border border-border rounded-lg px-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Fill</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={selectedElement.fillColor}
                      onChange={(e) => updateElement(selectedElement.id, { fillColor: e.target.value })}
                      className="w-8 h-8 rounded cursor-pointer border border-border" />
                    <span className="text-xs text-muted-foreground font-mono">{selectedElement.fillColor}</span>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Opacity: {Math.round(selectedElement.opacity * 100)}%</label>
                  <input type="range" min={0} max={1} step={0.01} value={selectedElement.opacity}
                    onChange={(e) => updateElement(selectedElement.id, { opacity: Number(e.target.value) })}
                    className="w-full accent-primary" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Rotation: {selectedElement.rotation}Â°</label>
                  <input type="range" min={0} max={360} value={selectedElement.rotation}
                    onChange={(e) => updateElement(selectedElement.id, { rotation: Number(e.target.value) })}
                    className="w-full accent-primary" />
                </div>
              </div>
            )}
          </div>
        );

      // â”€â”€ FINISH â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      case "finish":
        return (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Finish Options</h3>
            <div className="space-y-2">
              {FINISH_OPTIONS.map((opt) => (
                <button key={opt.id} onClick={() => updateDesign((prev) => ({ ...prev, finish: opt.id }))}
                  className={`w-full text-left p-3 rounded-xl border-2 transition ${currentDesign.finish === opt.id ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground"}`}>
                  <p className="text-sm font-medium text-foreground">{opt.name}</p>
                  <p className="text-xs text-muted-foreground">{opt.description}</p>
                </button>
              ))}
            </div>
          </div>
        );

      // â”€â”€ TEMPLATE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      case "template":
        return (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Templates</h3>
            <p className="text-xs text-muted-foreground">Applied to the <span className="font-semibold text-foreground">{activeView?.name ?? "current"}</span> view only.</p>
            <div className="space-y-2">
              {TEMPLATES.map((tpl) => (
                <button key={tpl.id} onClick={() => applyTemplate(tpl)}
                  className="w-full text-left p-3 rounded-xl border border-border hover:border-primary transition group">
                  <div className="w-full h-16 rounded-lg mb-2 border border-border overflow-hidden" style={{ backgroundColor: tpl.backgroundColor }}>
                    {tpl.elements.filter((e) => e.type === "text").slice(0, 1).map((e) => (
                      <div key={e.id} className="h-full flex items-center justify-center p-2">
                        <span className="text-xs font-medium truncate" style={{ color: (e as TextElement).color }}>
                          {(e as TextElement).text}
                        </span>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm font-medium text-foreground group-hover:text-primary transition">{tpl.name}</p>
                </button>
              ))}
            </div>
          </div>
        );

      // â”€â”€ SELECT (properties) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      default:
        return (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">
              {selectedElement ? "Element Properties" : "Selection"}
            </h3>
            {!selectedElement && (
              <p className="text-xs text-muted-foreground">Click an element on the canvas to select it, or use the tools to add new elements.</p>
            )}
            {selectedElement && (
              <div className="space-y-3">
                {/* Position */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-muted-foreground">X</label>
                    <input type="number" value={Math.round(selectedElement.x)}
                      onChange={(e) => updateElement(selectedElement.id, { x: Number(e.target.value) } as Partial<DesignElement>)}
                      className="w-full h-8 bg-muted border border-border rounded-lg px-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Y</label>
                    <input type="number" value={Math.round(selectedElement.y)}
                      onChange={(e) => updateElement(selectedElement.id, { y: Number(e.target.value) } as Partial<DesignElement>)}
                      className="w-full h-8 bg-muted border border-border rounded-lg px-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                </div>

                {/* Alignment */}
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block">Align to canvas</label>
                  <div className="grid grid-cols-3 gap-1">
                    {([
                      { key: "left", label: "â¬› Left" }, { key: "centerH", label: "â¬› Center" }, { key: "right", label: "â¬› Right" },
                      { key: "top", label: "â¬œ Top" }, { key: "centerV", label: "â¬œ Middle" }, { key: "bottom", label: "â¬œ Bottom" },
                    ] as const).map(({ key, label }) => (
                      <button key={key} onClick={() => alignElement(selectedElement.id, key)}
                        className="h-8 rounded-lg text-[10px] bg-muted text-muted-foreground hover:bg-primary hover:text-primary-foreground transition">
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Layer order */}
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block">Layer order</label>
                  <div className="grid grid-cols-4 gap-1">
                    <button onClick={() => sendToBack(selectedElement.id)} title="Send to back"
                      className="h-8 rounded-lg bg-muted text-muted-foreground hover:bg-muted/80 transition flex items-center justify-center">
                      <ChevronsDown size={14} />
                    </button>
                    <button onClick={() => sendBackward(selectedElement.id)} title="Move backward"
                      className="h-8 rounded-lg bg-muted text-muted-foreground hover:bg-muted/80 transition flex items-center justify-center">
                      <ChevronDown size={14} />
                    </button>
                    <button onClick={() => bringForward(selectedElement.id)} title="Move forward"
                      className="h-8 rounded-lg bg-muted text-muted-foreground hover:bg-muted/80 transition flex items-center justify-center">
                      <ChevronUp size={14} />
                    </button>
                    <button onClick={() => bringToFront(selectedElement.id)} title="Bring to front"
                      className="h-8 rounded-lg bg-muted text-muted-foreground hover:bg-muted/80 transition flex items-center justify-center">
                      <ChevronsUp size={14} />
                    </button>
                  </div>
                </div>

                {/* Lock / Rotate */}
                <div className="flex gap-2">
                  <button onClick={() => updateElement(selectedElement.id, { locked: !(selectedElement as TextElement).locked } as Partial<DesignElement>)}
                    className={`flex-1 h-9 flex items-center justify-center gap-1.5 text-xs rounded-lg font-medium transition ${(selectedElement as TextElement).locked ? "bg-amber-100 text-amber-700" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
                    {(selectedElement as TextElement).locked ? <><Lock size={12} /> Locked</> : <><Unlock size={12} /> Lock</>}
                  </button>
                  <button onClick={() => setClipboard({ ...selectedElement, id: generateId() })}
                    title="Copy element (Ctrl+C)"
                    className="flex-1 h-9 bg-muted text-muted-foreground rounded-lg text-xs font-medium hover:bg-muted/80 transition flex items-center justify-center gap-1">
                    <Copy size={12} /> Copy
                  </button>
                </div>

                {/* Duplicate / Delete */}
                <div className="flex gap-2">
                  <button onClick={() => duplicateElement(selectedElement.id)}
                    className="flex-1 h-9 bg-muted text-muted-foreground rounded-lg text-xs font-medium hover:bg-muted/80 transition flex items-center justify-center gap-1">
                    <Copy size={12} /> Duplicate
                  </button>
                  <button onClick={() => deleteElement(selectedElement.id)}
                    className="flex-1 h-9 bg-red-50 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100 transition flex items-center justify-center gap-1">
                    <Trash2 size={12} /> Delete
                  </button>
                </div>
              </div>
            )}

            {/* Keyboard shortcut hint */}
            <div className="pt-3 border-t border-border">
              <button onClick={() => setShowKeyboardShortcuts(true)}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition">
                <Keyboard size={12} /> View keyboard shortcuts
              </button>
            </div>
          </div>
        );
    }
  };

  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // ELEMENT RENDERER
  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const renderElement = (el: DesignElement) => {
    const isSelected = el.id === selectedElementId;
    const baseStyle: React.CSSProperties = {
      position: "absolute",
      left: el.x - el.width / 2,
      top: el.y - el.height / 2,
      width: el.width,
      height: el.height,
      transform: `rotate(${el.rotation}deg)`,
      transformOrigin: "center center",
      cursor: (el as TextElement).locked ? "not-allowed" : "move",
      zIndex: isSelected ? 10 : 1,
      opacity: el.opacity,
    };

    return (
      <div key={el.id} style={baseStyle}
        className={`${isSelected ? "ring-2 ring-primary ring-offset-1" : ""} ${(el as TextElement).locked ? "ring-1 ring-amber-400" : ""}`}
        onMouseDown={(e) => {
          e.stopPropagation();
          if ((el as TextElement).locked) return;
          setSelectedElementId(el.id);
          if (canvasRef.current) {
            const rect = canvasRef.current.getBoundingClientRect();
            const x = (e.clientX - rect.left) / zoom;
            const y = (e.clientY - rect.top) / zoom;
            setDragging({ elementId: el.id, offsetX: x - el.x, offsetY: y - el.y });
          }
        }}>
        {el.type === "text" && (
          <div style={{
            fontFamily: el.fontFamily,
            fontSize: el.fontSize,
            fontWeight: el.fontWeight,
            fontStyle: el.fontStyle,
            textAlign: el.textAlign,
            textDecoration: el.textDecoration,
            textTransform: el.textTransform,
            letterSpacing: el.letterSpacing,
            lineHeight: el.lineHeight,
            color: el.color,
            WebkitTextStroke: el.strokeWidth > 0 && el.strokeColor !== "transparent" ? `${el.strokeWidth}px ${el.strokeColor}` : undefined,
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: el.textAlign === "center" ? "center" : el.textAlign === "right" ? "flex-end" : "flex-start",
            userSelect: "none",
            whiteSpace: "pre-wrap",
            overflow: "hidden",
          }}>
            {el.text}
          </div>
        )}
        {el.type === "image" && (
          <div style={{ width: "100%", height: "100%", borderRadius: el.borderRadius, overflow: "hidden" }}>
            <Image
              src={el.src}
              alt="Design element"
              width={el.width}
              height={el.height}
              className="w-full h-full object-contain pointer-events-none"
              style={{
                transform: `scaleX(${el.flipX ? -1 : 1}) scaleY(${el.flipY ? -1 : 1})`,
                filter: `brightness(${el.brightness}%) contrast(${el.contrast}%)${el.grayscale ? " grayscale(100%)" : ""}`,
              }}
              unoptimized
            />
          </div>
        )}
        {el.type === "qr" && (
          <QRCodeSVG data={el.data} color={el.color} bgColor={el.bgColor} size={el.width} />
        )}
        {el.type === "shape" && (
          <ShapeSVG shape={el.shape} width={el.width} height={el.height} fillColor={el.fillColor} strokeColor={el.strokeColor} strokeWidth={el.strokeWidth} rx={el.rx} />
        )}

        {/* Lock indicator badge */}
        {(el as TextElement).locked && (
          <div style={{ position: "absolute", top: -8, right: -8, zIndex: 20 }}>
            <Lock size={10} className="text-amber-500" />
          </div>
        )}
      </div>
    );
  };

  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // VIEW SELECTOR STRIP
  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const ViewSelector = () => {
    if (productViews.length === 0) return null;
    return (
      <div className="flex items-center gap-1.5 px-3 py-2 bg-muted/60 border-b border-border overflow-x-auto shrink-0">
        <span className="text-xs text-muted-foreground shrink-0 mr-1 flex items-center gap-1">
          <Layers size={12} /> Views:
        </span>
        {productViews.map((view) => {
          const isActive = view.viewKey === activeViewKey;
          const hasEdits = editedViews.has(view.viewKey);
          return (
            <button key={view.viewKey} onClick={() => switchView(view.viewKey)} title={view.description ?? view.name}
              className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 transition border ${isActive ? "bg-primary text-primary-foreground border-primary shadow-sm" : "bg-card text-muted-foreground border-border hover:border-primary hover:text-foreground"}`}>
              <div className="w-6 h-6 rounded overflow-hidden bg-muted shrink-0">
                <Image src={view.baseImageUrl} alt={view.name} width={24} height={24} className="w-full h-full object-cover" unoptimized />
              </div>
              {view.name}
              {hasEdits && <CheckCircle2 size={12} className={isActive ? "text-primary-foreground/80" : "text-primary"} />}
            </button>
          );
        })}
        {/* Copy to all views */}
        {productViews.length > 1 && (
          <button onClick={copyDesignToAllViews} title="Copy this view's design to all views"
            className="ml-2 flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs text-muted-foreground border border-border hover:border-primary hover:text-primary transition shrink-0">
            <Wand2 size={12} /> Apply to all
          </button>
        )}
      </div>
    );
  };

  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // PREVIEW MODAL
  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const PreviewModal = () => (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setShowPreview(false)}>
      <div className="bg-card rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-bold text-foreground">Design Preview – All Views</h2>
          <button onClick={() => setShowPreview(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted transition text-muted-foreground">
            <X size={18} />
          </button>
        </div>
        <div className="p-6 space-y-6">
          <div className="flex items-center gap-4">
            {mainImage && (
              <div className="relative w-16 h-16 bg-muted rounded-xl overflow-hidden shrink-0">
                <Image src={mainImage.url} alt={product.name} fill className="object-contain" sizes="64px" />
              </div>
            )}
            <div>
              <h3 className="font-semibold text-foreground">{product.name}</h3>
              <p className="text-sm text-muted-foreground">{designName}</p>
              <p className="text-xs text-primary mt-0.5">Qty: {quantity} · ₦{(product.price * quantity).toLocaleString()}</p>
            </div>
          </div>

          {productViews.length === 0 ? (
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-2">Design Canvas</h4>
              <div className="relative mx-auto rounded-xl overflow-hidden border border-border shadow-lg"
                style={{ width: Math.min(currentDesign.canvasWidth, 550), height: Math.min(currentDesign.canvasHeight, 370), ...getPatternStyle(currentDesign.backgroundPattern, currentDesign.backgroundColor, currentDesign.backgroundGradient) }}>
                {currentDesign.elements.map(renderElement)}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {productViews.map((view) => {
                const vd = viewDesigns[view.viewKey];
                const hasEdits = editedViews.has(view.viewKey);
                return (
                  <div key={view.viewKey}>
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="text-sm font-semibold text-foreground">{view.name}</h4>
                      {hasEdits && <span className="text-xs text-primary font-medium flex items-center gap-1"><CheckCircle2 size={11} /> Edited</span>}
                    </div>
                    <div className="relative rounded-xl overflow-hidden border border-border shadow bg-muted" style={{ aspectRatio: "3/2" }}>
                      <Image src={view.baseImageUrl} alt={view.name} fill className="object-contain" sizes="300px" />
                      {vd && vd.elements.length > 0 && (
                        <div className="absolute inset-0 pointer-events-none"
                          style={{ ...getPatternStyle(vd.backgroundPattern, vd.backgroundColor, vd.backgroundGradient), opacity: vd.backgroundColor === "#ffffff" && !vd.backgroundPattern && !vd.backgroundGradient ? 0 : 0.85 }}>
                          <div style={{ position: "relative", width: vd.canvasWidth, height: vd.canvasHeight, transform: "scale(0.45)", transformOrigin: "top left" }}>
                            {vd.elements.map(renderElement)}
                          </div>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{vd?.elements.length ?? 0} element(s) · {vd?.finish ?? "matte"} finish</p>
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-end pt-4 border-t border-border">
            <button onClick={() => setShowPreview(false)}
              className="h-10 px-4 bg-muted text-muted-foreground rounded-lg text-sm font-medium hover:bg-muted/80 transition">
              Continue Editing
            </button>
            <button onClick={async () => { await saveDesign(); setShowPreview(false); }} disabled={saving}
              className="h-10 px-5 bg-muted text-foreground border border-border rounded-lg text-sm font-medium hover:bg-muted/80 transition disabled:opacity-50">
              {saving ? "Saving..." : "Save Draft"}
            </button>
            <button onClick={async () => { await handleAddToCart(); setShowPreview(false); }} disabled={addingToCart}
              className="h-10 px-6 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition disabled:opacity-50 flex items-center gap-2">
              <ShoppingCart size={15} /> {addingToCart ? "Adding..." : "Add to Cart"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // KEYBOARD SHORTCUTS MODAL
  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const KeyboardShortcutsModal = () => (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowKeyboardShortcuts(false)}>
      <div className="bg-card rounded-2xl max-w-sm w-full p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2"><Keyboard size={16} /> Keyboard Shortcuts</h2>
          <button onClick={() => setShowKeyboardShortcuts(false)} className="text-muted-foreground hover:text-foreground"><X size={16} /></button>
        </div>
        <div className="space-y-2 text-sm">
          {[
            ["Delete / Backspace", "Delete selected element"],
            ["Ctrl + Z", "Undo"],
            ["Ctrl + Y", "Redo"],
            ["Ctrl + D", "Duplicate element"],
            ["Ctrl + C", "Copy element"],
            ["Ctrl + V", "Paste element"],
            ["Arrow keys", "Nudge 10px"],
            ["Shift + Arrow keys", "Nudge 1px"],
            ["[ / ]", "Layer order backward/forward"],
            ["Escape", "Deselect"],
          ].map(([key, desc]) => (
            <div key={key} className="flex items-center justify-between py-1.5 border-b border-border/50 last:border-0">
              <span className="text-muted-foreground text-xs">{desc}</span>
              <kbd className="text-[10px] bg-muted border border-border rounded px-1.5 py-0.5 font-mono shrink-0 ml-2">{key}</kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // RIGHT PANEL
  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const RightPanel = () => (
    <div className="w-64 bg-card border-l border-border flex flex-col shrink-0 hidden xl:flex overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-border shrink-0">
        {(["product", "layers", "summary"] as const).map((tab) => (
          <button key={tab} onClick={() => setRightPanelTab(tab)}
            className={`flex-1 py-2.5 text-xs font-medium capitalize transition ${rightPanelTab === tab ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"}`}>
            {tab}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {/* â”€â”€ Product tab â”€â”€ */}
        {rightPanelTab === "product" && (
          <div className="space-y-4">
            {mainImage && (
              <div className="relative w-full aspect-square bg-muted rounded-xl overflow-hidden">
                <Image src={mainImage.url} alt={product.name} fill className="object-contain" sizes="240px" />
                <div className="absolute bottom-1.5 right-1.5 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded">Base image</div>
              </div>
            )}
            <div>
              <h4 className="text-sm font-semibold text-foreground">{product.name}</h4>
              <p className="text-xs text-muted-foreground mt-0.5">{product.sku}</p>
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Unit price</span>
                <span className="font-medium">₦{product.price.toLocaleString()}</span>
              </div>
              {(product.printPrice ?? 0) > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Print fee</span>
                  <span className="font-medium text-primary">+₦{(product.printPrice ?? 0).toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery</span>
                <span className="font-medium text-xs">{product.deliveryTime ?? "3-7 days"}</span>
              </div>
            </div>

            {/* Finish badge */}
            <div className="flex items-center gap-2 p-2 rounded-lg bg-muted">
              <Sparkles size={14} className="text-primary" />
              <span className="text-xs text-muted-foreground">Finish: <span className="font-medium text-foreground capitalize">{currentDesign.finish}</span></span>
            </div>

            {/* Views list */}
            {productViews.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Views</h3>
                <div className="space-y-1">
                  {productViews.map((view) => (
                    <button key={view.viewKey} onClick={() => switchView(view.viewKey)}
                      className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs transition ${view.viewKey === activeViewKey ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted"}`}>
                      <div className="w-8 h-8 rounded overflow-hidden bg-muted shrink-0">
                        <Image src={view.baseImageUrl} alt={view.name} width={32} height={32} className="w-full h-full object-cover" unoptimized />
                      </div>
                      <span className="truncate flex-1">{view.name}</span>
                      {editedViews.has(view.viewKey) && <CheckCircle2 size={12} className="shrink-0 text-primary" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* â”€â”€ Layers tab â”€â”€ */}
        {rightPanelTab === "layers" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Layers – {activeView?.name ?? "Canvas"}
              </h3>
              <span className="text-xs text-muted-foreground">{currentDesign.elements.length} items</span>
            </div>

            {currentDesign.elements.length === 0 ? (
              <p className="text-xs text-muted-foreground italic py-4 text-center">No elements yet.<br />Use the tools to add text, images or shapes.</p>
            ) : (
              <div className="space-y-1">
                {[...currentDesign.elements].reverse().map((el, reverseIdx) => {
                  const actualIdx = currentDesign.elements.length - 1 - reverseIdx;
                  return (
                    <div key={el.id}
                      className={`flex items-center gap-2 px-2 py-2 rounded-lg cursor-pointer transition ${el.id === selectedElementId ? "bg-primary/10 ring-1 ring-primary/30" : "hover:bg-muted"}`}
                      onClick={() => setSelectedElementId(el.id)}>
                      <div className="text-muted-foreground shrink-0">
                        {el.type === "text" ? <Type size={12} /> : el.type === "image" ? <ImageIcon size={12} /> : el.type === "qr" ? <QrCode size={12} /> : <Square size={12} />}
                      </div>
                      <span className={`text-xs truncate flex-1 ${el.id === selectedElementId ? "text-primary font-medium" : "text-muted-foreground"}`}>
                        {el.type === "text" ? (el as TextElement).text.slice(0, 18) || "Empty text"
                          : el.type === "image" ? "Image"
                          : el.type === "qr" ? `QR: ${(el as QRElement).data.slice(0, 12)}`
                          : `${(el as ShapeElement).shape}`}
                      </span>
                      <span className="text-[10px] text-muted-foreground/60 shrink-0">#{actualIdx + 1}</span>
                      {(el as TextElement).locked && <Lock size={10} className="text-amber-500 shrink-0" />}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Clipboard paste */}
            {clipboard && (
              <button onClick={pasteFromClipboard}
                className="w-full h-9 flex items-center justify-center gap-2 text-xs border border-dashed border-border rounded-lg text-muted-foreground hover:border-primary hover:text-primary transition">
                <ClipboardPaste size={13} /> Paste copied element
              </button>
            )}

            {/* Clear view */}
            {currentDesign.elements.length > 0 && (
              <button onClick={clearCurrentView}
                className="w-full h-9 flex items-center justify-center gap-2 text-xs text-red-500 border border-red-200/50 rounded-lg hover:bg-red-50 transition">
                <Trash2 size={12} /> Clear this view
              </button>
            )}
          </div>
        )}

        {/* â”€â”€ Summary tab (Order) â”€â”€ */}
        {rightPanelTab === "summary" && (
          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Order Summary</h3>

            {/* Quantity */}
            <div>
              <label className="text-xs text-muted-foreground mb-2 block">Quantity</label>
              <div className="flex items-center gap-2">
                <button onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-9 h-9 flex items-center justify-center rounded-lg bg-muted hover:bg-muted/80 transition text-muted-foreground disabled:opacity-30"
                  disabled={quantity <= 1}>
                  <Minus size={14} />
                </button>
                <input type="number" value={quantity} min={1}
                  onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                  className="flex-1 h-9 bg-muted border border-border rounded-lg text-center text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary" />
                <button onClick={() => setQuantity((q) => q + 1)}
                  className="w-9 h-9 flex items-center justify-center rounded-lg bg-muted hover:bg-muted/80 transition text-muted-foreground">
                  <Plus size={14} />
                </button>
              </div>
            </div>

            {/* Price breakdown */}
            <div className="space-y-2 p-3 bg-muted/50 rounded-xl text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Unit price</span>
                <span>₦{product.price.toLocaleString()}</span>
              </div>
              {product.allowCustomPrint && (product.printPrice ?? 0) > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Print fee</span>
                  <span className="text-primary">+₦{(product.printPrice ?? 0).toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Quantity</span>
                <span>× {quantity}</span>
              </div>
              <div className="border-t border-border pt-2 flex justify-between font-semibold text-sm">
                <span className="text-foreground">Subtotal</span>
                <span className="text-primary">₦{((product.price + (product.allowCustomPrint ? (product.printPrice ?? 0) : 0)) * quantity).toLocaleString()}</span>
              </div>
              <p className="text-muted-foreground text-[10px]">+ 7.5% VAT at checkout</p>
            </div>

            {/* Design summary */}
            <div className="space-y-2 text-xs text-muted-foreground">
              <div className="flex justify-between">
                <span>Elements (this view)</span>
                <span className="font-medium text-foreground">{currentDesign.elements.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Views edited</span>
                <span className="font-medium text-foreground">{editedViews.size} / {productViews.length || 1}</span>
              </div>
              <div className="flex justify-between">
                <span>Finish</span>
                <span className="font-medium text-foreground capitalize">{currentDesign.finish}</span>
              </div>
              {lastSaved && (
                <div className="flex justify-between">
                  <span>Last saved</span>
                  <span className="font-medium text-green-600">{lastSaved.toLocaleTimeString()}</span>
                </div>
              )}
            </div>

            {/* Save draft + Add to cart */}
            <div className="space-y-2 pt-2 border-t border-border">
              <button onClick={saveDesign} disabled={saving}
                className="w-full h-10 flex items-center justify-center gap-2 bg-muted text-foreground rounded-lg text-sm font-medium hover:bg-muted/80 transition disabled:opacity-50">
                <Save size={15} /> {saving ? "Saving..." : "Save Draft"}
              </button>
              <button onClick={handleAddToCart} disabled={addingToCart || saving}
                className="w-full h-11 flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition disabled:opacity-50 shadow-sm">
                <ShoppingCart size={16} /> {addingToCart ? "Adding to Cart..." : "Add to Cart"}
              </button>
              <Link href="/cart"
                className="w-full h-9 flex items-center justify-center gap-2 text-xs text-primary border border-primary/30 rounded-lg hover:bg-primary/5 transition">
                View Cart
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );


  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // MAIN RENDER
  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  return (
    <>
      <main className="flex-1 pt-20 md:pt-24">
        {/* â”€â”€ Top toolbar â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <div className="bg-card border-b border-border px-4 sm:px-6 py-3">
          <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-4">

            {/* Left: Back + Design name */}
            <div className="flex items-center gap-3 min-w-0">
              <Link href={`/products/${slug}`}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition shrink-0">
                <ChevronLeft size={16} /> Back
              </Link>
              <div className="h-5 w-px bg-border shrink-0" />
              <input
                type="text"
                value={designName}
                onChange={(e) => setDesignName(e.target.value)}
                className="text-sm font-semibold text-foreground bg-transparent border-none outline-none min-w-0 truncate focus:ring-0 max-w-[180px]"
                placeholder="Design name…"
              />
              {lastSaved && (
                <span className="hidden sm:inline text-xs text-green-600 shrink-0">
                  Saved {lastSaved.toLocaleTimeString()}
                </span>
              )}
            </div>

            {/* Right: Controls */}
            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              {/* Undo / Redo */}
              <button onClick={undo} disabled={!canUndo} title="Undo (Ctrl+Z)"
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted disabled:opacity-30 transition text-muted-foreground">
                <Undo2 size={16} />
              </button>
              <button onClick={redo} disabled={!canRedo} title="Redo (Ctrl+Y)"
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted disabled:opacity-30 transition text-muted-foreground">
                <Redo2 size={16} />
              </button>

              {/* Zoom */}
              <div className="hidden sm:flex items-center gap-1">
                <div className="h-5 w-px bg-border" />
                <button onClick={() => setZoom((z) => Math.max(0.3, parseFloat((z - 0.1).toFixed(1))))}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted transition text-muted-foreground">
                  <ZoomOut size={16} />
                </button>
                <button onClick={() => setZoom(1)}
                  className="text-xs text-muted-foreground w-12 text-center hover:text-foreground transition">
                  {Math.round(zoom * 100)}%
                </button>
                <button onClick={() => setZoom((z) => Math.min(2.5, parseFloat((z + 0.1).toFixed(1))))}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted transition text-muted-foreground">
                  <ZoomIn size={16} />
                </button>
              </div>

              {/* Print specs toggle */}
              <div className="hidden sm:block h-5 w-px bg-border" />
              <button onClick={() => setShowPrintSpecs((s) => !s)} title="Toggle print specs"
                className={`hidden sm:flex w-8 h-8 items-center justify-center rounded-lg transition text-xs font-bold ${showPrintSpecs ? "bg-primary/10 text-primary" : "hover:bg-muted text-muted-foreground"}`}>
                âŒ–
              </button>

              {/* Keyboard shortcuts */}
              <button onClick={() => setShowKeyboardShortcuts(true)} title="Keyboard shortcuts"
                className="hidden sm:flex w-8 h-8 items-center justify-center rounded-lg hover:bg-muted transition text-muted-foreground">
                <Keyboard size={15} />
              </button>

              <div className="h-5 w-px bg-border" />

              {/* Preview */}
              <button onClick={() => setShowPreview(true)}
                className="h-9 w-9 sm:w-auto sm:px-3 bg-muted text-muted-foreground rounded-lg text-sm font-medium hover:bg-muted/80 transition flex items-center justify-center gap-1.5">
                <Eye size={15} />
                <span className="hidden sm:inline">Preview</span>
              </button>

              {/* Save */}
              <button onClick={saveDesign} disabled={saving}
                className="h-9 w-9 sm:w-auto sm:px-3 bg-muted text-foreground border border-border rounded-lg text-sm font-medium hover:bg-muted/80 transition flex items-center justify-center gap-1.5 disabled:opacity-50">
                <Save size={15} />
                <span className="hidden sm:inline">{saving ? "Saving…" : "Save Draft"}</span>
              </button>

              {/* Add to Cart */}
              <button onClick={handleAddToCart} disabled={addingToCart || saving}
                className="h-9 px-3 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition flex items-center justify-center gap-1.5 disabled:opacity-50">
                <ShoppingCart size={15} />
                <span className="hidden sm:inline">{addingToCart ? "Adding…" : "Add to Cart"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* â”€â”€ Editor body â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <div className="flex relative" style={{ height: "calc(100vh - 126px)" }}>

          {/* Left: Tool icon strip (desktop) */}
          <div className="hidden md:flex w-14 bg-card border-r border-border flex-col items-center py-3 gap-1 shrink-0">
            {([
              { id: "select" as ToolType, icon: Move, label: "Select" },
              { id: "text" as ToolType, icon: Type, label: "Text" },
              { id: "image" as ToolType, icon: ImageIcon, label: "Image" },
              { id: "shapes" as ToolType, icon: Square, label: "Shapes" },
              { id: "color" as ToolType, icon: Palette, label: "Background" },
              { id: "qr" as ToolType, icon: QrCode, label: "QR Code" },
              { id: "finish" as ToolType, icon: Sparkles, label: "Finish" },
              { id: "template" as ToolType, icon: LayoutTemplate, label: "Templates" },
            ]).map((tool) => (
              <button key={tool.id} onClick={() => setActiveTool(tool.id)} title={tool.label}
                className={`w-10 h-10 rounded-lg flex items-center justify-center transition ${activeTool === tool.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}>
                <tool.icon size={18} />
              </button>
            ))}
          </div>

          {/* Left panel: Tool options (desktop) */}
          <div className="hidden md:block w-64 bg-card border-r border-border p-4 overflow-y-auto shrink-0">
            {renderToolPanel()}
          </div>

          {/* Center: Canvas + view selector */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <ViewSelector />

            {/* Canvas scroll area */}
            <div className="flex-1 bg-muted/40 overflow-auto flex items-center justify-center relative pb-16 md:pb-0" style={{ background: "repeating-conic-gradient(#e2e8f0 0% 25%, transparent 0% 50%) 0 0 / 20px 20px" }}>
              <div
                ref={canvasRef}
                className="relative rounded-lg shadow-2xl overflow-hidden touch-none select-none"
                style={{
                  width: currentDesign.canvasWidth * zoom,
                  height: currentDesign.canvasHeight * zoom,
                  ...getPatternStyle(currentDesign.backgroundPattern, currentDesign.backgroundColor, currentDesign.backgroundGradient),
                }}
                onMouseDown={handleCanvasMouseDown}
                onMouseMove={handleCanvasMouseMove}
                onMouseUp={handleCanvasMouseUp}
                onMouseLeave={handleCanvasMouseUp}
                onTouchStart={handleCanvasTouchStart}
                onTouchMove={handleCanvasTouchMove}
                onTouchEnd={handleCanvasTouchEnd}
              >
                {/* Base product image */}
                {baseImageUrl && (
                  <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }}>
                    <Image
                      src={baseImageUrl}
                      alt={activeView?.name ?? product.name}
                      fill className="object-contain"
                      sizes={`${currentDesign.canvasWidth}px`}
                      priority unoptimized
                    />
                  </div>
                )}

                {/* Design overlay elements */}
                <div style={{ transform: `scale(${zoom})`, transformOrigin: "top left", width: currentDesign.canvasWidth, height: currentDesign.canvasHeight, position: "relative", zIndex: 1 }}>
                  {currentDesign.elements.map(renderElement)}
                </div>

                {/* Snap guides */}
                {(snapIndicator.x || snapIndicator.y) && (
                  <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 50 }}>
                    {snapIndicator.x && (
                      <div className="absolute top-0 bottom-0 border-l-2 border-dashed border-primary/60" style={{ left: currentDesign.canvasWidth / 2 * zoom }} />
                    )}
                    {snapIndicator.y && (
                      <div className="absolute left-0 right-0 border-t-2 border-dashed border-primary/60" style={{ top: currentDesign.canvasHeight / 2 * zoom }} />
                    )}
                  </div>
                )}

                {/* Print specs overlay */}
                {showPrintSpecs && (
                  <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 40 }}>
                    {/* Bleed area */}
                    <div className="absolute inset-0 border-4 border-dashed border-red-400/50" />
                    {/* Safe zone */}
                    <div className="absolute border-2 border-dashed border-green-500/50"
                      style={{ top: 20 * zoom, bottom: 20 * zoom, left: 20 * zoom, right: 20 * zoom }} />
                    <div className="absolute top-2 left-2 bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded font-medium">Bleed</div>
                    <div className="absolute bg-green-500 text-white text-[9px] px-1.5 py-0.5 rounded font-medium"
                      style={{ top: 24 * zoom, left: 24 * zoom }}>Safe zone</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right panel (xl screens) */}
          <RightPanel />

          {/* Mobile: bottom toolbar */}
          <div className="md:hidden fixed bottom-0 left-0 right-0 z-30">
            {mobilePanelOpenState && (
              <div className="bg-card border-t border-border max-h-[50vh] overflow-y-auto px-4 py-3 shadow-xl">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-foreground capitalize">{activeTool}</h3>
                  <button onClick={() => setMobilePanelOpenState(false)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted transition text-muted-foreground">
                    <X size={16} />
                  </button>
                </div>
                {renderToolPanel()}
              </div>
            )}
            <div className="bg-card border-t border-border px-2 py-2 flex items-center justify-around gap-1">
              {([
                { id: "select" as ToolType, icon: Move, label: "Select" },
                { id: "text" as ToolType, icon: Type, label: "Text" },
                { id: "image" as ToolType, icon: ImageIcon, label: "Image" },
                { id: "shapes" as ToolType, icon: Square, label: "Shape" },
                { id: "color" as ToolType, icon: Palette, label: "Color" },
                { id: "qr" as ToolType, icon: QrCode, label: "QR" },
                { id: "template" as ToolType, icon: LayoutTemplate, label: "Template" },
              ]).map((tool) => (
                <button key={tool.id} onClick={() => handleMobileToolClick(tool.id)}
                  className={`flex flex-col items-center justify-center gap-0.5 py-1.5 px-1.5 rounded-lg transition min-w-0 ${activeTool === tool.id ? "bg-primary/10 text-primary" : "text-muted-foreground"}`}>
                  <tool.icon size={17} />
                  <span className="text-[9px] leading-tight">{tool.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>

      {showPreview && <PreviewModal />}
      {showKeyboardShortcuts && <KeyboardShortcutsModal />}
    </>
  );
}
