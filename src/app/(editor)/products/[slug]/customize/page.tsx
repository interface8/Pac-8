"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
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
} from "lucide-react";
import { useProduct } from "@/hooks/use-products";
import { toast } from "react-toastify";

// ─── Types ─────────────────────────────────────────────
type ToolType = "select" | "text" | "image" | "color" | "qr" | "finish" | "template";

type FinishType = "matte" | "glossy" | "embossed" | "spot-uv";

/** A product view definition (front, back, left, right, top, bottom) */
interface ProductView {
  id: string;
  viewKey: string;
  name: string;
  baseImageUrl: string; // static product image — never modified by user
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
  rotation: number;
}

type DesignElement = TextElement | ImageElement | QRElement;

/** Per-view design state (canvas overlay only — does NOT contain the product base image) */
interface ViewDesignState {
  elements: DesignElement[];
  backgroundColor: string;
  backgroundPattern: string | null;
  finish: FinishType;
  canvasWidth: number;
  canvasHeight: number;
}

/** Serialised format stored in SavedDesign.designData (version 2) */
interface MultiViewDesignData {
  version: "2";
  views: Record<string, ViewDesignState>;
}

const DEFAULT_VIEW_DESIGN: ViewDesignState = {
  elements: [],
  backgroundColor: "#ffffff",
  backgroundPattern: null,
  finish: "matte",
  canvasWidth: 600,
  canvasHeight: 400,
};

// ─── Templates ─────────────────────────────────────────
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
        x: 200,
        y: 180,
        width: 200,
        height: 50,
        text: "Your Brand",
        fontFamily: "Inter",
        fontSize: 32,
        fontWeight: "bold",
        fontStyle: "normal",
        textAlign: "center",
        color: "#1a1a1a",
        rotation: 0,
      },
      {
        type: "text",
        id: "t2",
        x: 200,
        y: 240,
        width: 200,
        height: 30,
        text: "Premium Packaging",
        fontFamily: "Inter",
        fontSize: 14,
        fontWeight: "normal",
        fontStyle: "normal",
        textAlign: "center",
        color: "#666666",
        rotation: 0,
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
        type: "text",
        id: "t1",
        x: 200,
        y: 200,
        width: 250,
        height: 60,
        text: "BRAND NAME",
        fontFamily: "Inter",
        fontSize: 36,
        fontWeight: "bold",
        fontStyle: "normal",
        textAlign: "center",
        color: "#ffffff",
        rotation: 0,
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
        x: 200,
        y: 160,
        width: 200,
        height: 40,
        text: "ECO",
        fontFamily: "Inter",
        fontSize: 28,
        fontWeight: "bold",
        fontStyle: "normal",
        textAlign: "center",
        color: "#166534",
        rotation: 0,
      },
      {
        type: "text",
        id: "t2",
        x: 200,
        y: 210,
        width: 250,
        height: 30,
        text: "Sustainable Packaging",
        fontFamily: "Inter",
        fontSize: 14,
        fontWeight: "normal",
        fontStyle: "italic",
        textAlign: "center",
        color: "#166534",
        rotation: 0,
      },
    ],
    backgroundColor: "#dcfce7",
  },
];

const COLORS = [
  "#ffffff", "#f8fafc", "#f1f5f9", "#e2e8f0",
  "#1a1a1a", "#374151", "#6b7280", "#9ca3af",
  "#ef4444", "#f97316", "#eab308", "#22c55e",
  "#3b82f6", "#6366f1", "#8b5cf6", "#ec4899",
  "#7c3aed", "#2563eb", "#0891b2", "#059669",
];

const FONT_FAMILIES = ["Inter", "Georgia", "Courier New", "Arial", "Times New Roman", "Verdana"];

const PATTERNS = [
  { id: "none", name: "None" },
  { id: "dots", name: "Dots" },
  { id: "stripes", name: "Stripes" },
  { id: "grid", name: "Grid" },
  { id: "diagonal", name: "Diagonal" },
];

const FINISH_OPTIONS: { id: FinishType; name: string; description: string }[] = [
  { id: "matte", name: "Matte", description: "Smooth, non-reflective finish" },
  { id: "glossy", name: "Glossy", description: "High-shine reflective finish" },
  { id: "embossed", name: "Embossed", description: "Raised 3D texture effect" },
  { id: "spot-uv", name: "Spot UV", description: "Selective gloss coating" },
];

function generateId() {
  return `el_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

// ─── Simple QR code SVG generator ──────────────────────
function QRCodeSVG({ data, color, size }: { data: string; color: string; size: number }) {
  // Simple visual representation - a real QR would need a library
  const cells = 11;
  const cellSize = size / cells;
  // Generate a deterministic pattern from the data string
  const pattern: boolean[][] = [];
  for (let r = 0; r < cells; r++) {
    pattern[r] = [];
    for (let c = 0; c < cells; c++) {
      // Finder patterns (top-left, top-right, bottom-left)
      const isFinderTL = r < 3 && c < 3;
      const isFinderTR = r < 3 && c >= cells - 3;
      const isFinderBL = r >= cells - 3 && c < 3;
      if (isFinderTL || isFinderTR || isFinderBL) {
        pattern[r][c] = true;
        continue;
      }
      // Data pattern from hash
      const hash = (data.charCodeAt((r * cells + c) % data.length) || 0) + r * 7 + c * 13;
      pattern[r][c] = hash % 3 !== 0;
    }
  }

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {pattern.map((row, r) =>
        row.map((cell, c) =>
          cell ? (
            <rect key={`${r}-${c}`} x={c * cellSize} y={r * cellSize} width={cellSize} height={cellSize} fill={color} />
          ) : null
        )
      )}
    </svg>
  );
}

// ─── Canvas Pattern Renderer ───────────────────────────
function getPatternStyle(pattern: string | null, bgColor: string): React.CSSProperties {
  if (!pattern || pattern === "none") return { backgroundColor: bgColor };
  const patternColor = `rgba(0,0,0,0.06)`;
  switch (pattern) {
    case "dots":
      return {
        backgroundColor: bgColor,
        backgroundImage: `radial-gradient(${patternColor} 1.5px, transparent 1.5px)`,
        backgroundSize: "16px 16px",
      };
    case "stripes":
      return {
        backgroundColor: bgColor,
        backgroundImage: `repeating-linear-gradient(0deg, ${patternColor}, ${patternColor} 1px, transparent 1px, transparent 12px)`,
      };
    case "grid":
      return {
        backgroundColor: bgColor,
        backgroundImage: `linear-gradient(${patternColor} 1px, transparent 1px), linear-gradient(90deg, ${patternColor} 1px, transparent 1px)`,
        backgroundSize: "20px 20px",
      };
    case "diagonal":
      return {
        backgroundColor: bgColor,
        backgroundImage: `repeating-linear-gradient(45deg, ${patternColor}, ${patternColor} 1px, transparent 1px, transparent 14px)`,
      };
    default:
      return { backgroundColor: bgColor };
  }
}

// ─── Main Editor Component ─────────────────────────────
export default function CustomizeProductPage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = params;
  const { product, loading, error } = useProduct(slug);

  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── View state ────────────────────────────────────────
  const [productViews, setProductViews] = useState<ProductView[]>([]);
  const [viewsLoading, setViewsLoading] = useState(true);
  /** Per-view designs keyed by viewKey — edits are stored separately per view */
  const [viewDesigns, setViewDesigns] = useState<Record<string, ViewDesignState>>({});
  const [activeViewKey, setActiveViewKey] = useState<string>("");

  /** Current view's design (convenience accessor — derived from viewDesigns[activeViewKey]) */
  const currentDesign: ViewDesignState = viewDesigns[activeViewKey] ?? DEFAULT_VIEW_DESIGN;

  const setCurrentDesign = useCallback(
    (updater: (prev: ViewDesignState) => ViewDesignState) => {
      setViewDesigns((prev) => ({
        ...prev,
        [activeViewKey]: updater(prev[activeViewKey] ?? DEFAULT_VIEW_DESIGN),
      }));
    },
    [activeViewKey]
  );
  // silence "setCurrentDesign defined but never used" — it's used by updateDesign
  void setCurrentDesign;

  // ── General editor state ──────────────────────────────
  const [activeTool, setActiveTool] = useState<ToolType>("select");
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [designName, setDesignName] = useState("Untitled Design");
  const [existingDesignId, setExistingDesignId] = useState<string | null>(null);
  const [dragging, setDragging] = useState<{
    elementId: string;
    offsetX: number;
    offsetY: number;
  } | null>(null);
  const [qrInput, setQrInput] = useState("https://pac8.store");

  const selectedElement = currentDesign.elements.find((el) => el.id === selectedElementId) ?? null;

  // ── Per-view undo/redo ────────────────────────────────
  const historyRef = useRef<Record<string, ViewDesignState[]>>({});
  const historyIndexRef = useRef<Record<string, number>>({});
  const [, setHistoryTick] = useState(0);
  const tickRender = () => setHistoryTick((t) => t + 1);

  const pushHistory = useCallback((viewKey: string, newDesign: ViewDesignState) => {
    if (!historyRef.current[viewKey]) {
      historyRef.current[viewKey] = [newDesign];
      historyIndexRef.current[viewKey] = 0;
      return;
    }
    const idx = historyIndexRef.current[viewKey];
    historyRef.current[viewKey] = [
      ...historyRef.current[viewKey].slice(0, idx + 1),
      newDesign,
    ];
    historyIndexRef.current[viewKey] = idx + 1;
    tickRender();
  }, []);

  const undo = useCallback(() => {
    const idx = historyIndexRef.current[activeViewKey] ?? 0;
    if (idx > 0) {
      historyIndexRef.current[activeViewKey] = idx - 1;
      const prev = historyRef.current[activeViewKey][idx - 1];
      setViewDesigns((vd) => ({ ...vd, [activeViewKey]: prev }));
      tickRender();
    }
  }, [activeViewKey]);

  const redo = useCallback(() => {
    const idx = historyIndexRef.current[activeViewKey] ?? 0;
    const hist = historyRef.current[activeViewKey] ?? [];
    if (idx < hist.length - 1) {
      historyIndexRef.current[activeViewKey] = idx + 1;
      const next = hist[idx + 1];
      setViewDesigns((vd) => ({ ...vd, [activeViewKey]: next }));
      tickRender();
    }
  }, [activeViewKey]);

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

  // ── Load product views from API ───────────────────────
  useEffect(() => {
    if (!product) return;
    setViewsLoading(true);
    fetch(`/api/products/${product.id}/views`)
      .then((r) => r.json())
      .then((json) => {
        const views: ProductView[] = json.data ?? [];
        setProductViews(views);
        if (views.length > 0) {
          const defaultView = views.find((v) => v.isDefault) ?? views[0];
          setActiveViewKey(defaultView.viewKey);
          // Initialise an empty independent design for every view
          const initial: Record<string, ViewDesignState> = {};
          views.forEach((v) => {
            initial[v.viewKey] = { ...DEFAULT_VIEW_DESIGN };
          });
          setViewDesigns(initial);
        } else {
          // No views configured — use a single "default" canvas
          setActiveViewKey("default");
          setViewDesigns({ default: { ...DEFAULT_VIEW_DESIGN } });
        }
      })
      .catch(() => {
        setActiveViewKey("default");
        setViewDesigns({ default: { ...DEFAULT_VIEW_DESIGN } });
      })
      .finally(() => setViewsLoading(false));
  }, [product]);

  // ── Switch active view ────────────────────────────────
  const switchView = (viewKey: string) => {
    if (viewKey === activeViewKey) return;
    setSelectedElementId(null); // deselect element when switching views
    setActiveTool("select");
    setActiveViewKey(viewKey);
  };

  // ── Element operations ────────────────────────────────
  const addTextElement = () => {
    const id = generateId();
    updateDesign((prev) => ({
      ...prev,
      elements: [
        ...prev.elements,
        {
          type: "text",
          id,
          x: 150,
          y: 150,
          width: 200,
          height: 40,
          text: "Your Text Here",
          fontFamily: "Inter",
          fontSize: 24,
          fontWeight: "normal",
          fontStyle: "normal",
          textAlign: "center",
          color: "#1a1a1a",
          rotation: 0,
        },
      ],
    }));
    setSelectedElementId(id);
    setActiveTool("select");
  };

  const addImageElement = (src: string) => {
    const id = generateId();
    updateDesign((prev) => ({
      ...prev,
      elements: [
        ...prev.elements,
        { type: "image", id, x: 150, y: 100, width: 150, height: 150, src, rotation: 0 },
      ],
    }));
    setSelectedElementId(id);
    setActiveTool("select");
  };

  const addQRElement = (data: string) => {
    const id = generateId();
    updateDesign((prev) => ({
      ...prev,
      elements: [
        ...prev.elements,
        { type: "qr", id, x: 200, y: 150, width: 100, height: 100, data, color: "#1a1a1a", rotation: 0 },
      ],
    }));
    setSelectedElementId(id);
    setActiveTool("select");
  };

  const updateElement = (id: string, updates: Partial<DesignElement>) => {
    updateDesign((prev) => ({
      ...prev,
      elements: prev.elements.map((el) =>
        el.id === id ? ({ ...el, ...updates } as DesignElement) : el
      ),
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
      elements: [...prev.elements, { ...el, id: newId, x: el.x + 20, y: el.y + 20 }],
    }));
    setSelectedElementId(newId);
  };

  // ── File upload ───────────────────────────────────────
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowedTypes = ["image/png", "image/jpeg", "image/svg+xml", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Please upload a PNG, JPEG, SVG, or WebP image");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be under 5MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") addImageElement(reader.result);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // ── Template apply (current view only) ───────────────
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

  // ── Save design (all views serialised together) ───────
  const saveDesign = async () => {
    if (!product) return;
    setSaving(true);
    try {
      const payload: MultiViewDesignData = { version: "2", views: viewDesigns };
      const bodyStr = JSON.stringify({
        productId: product.id,
        name: designName,
        designData: JSON.stringify(payload),
      });

      const url = existingDesignId ? `/api/designs/${existingDesignId}` : "/api/designs";
      const method = existingDesignId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: bodyStr,
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.message ?? "Failed to save");
      }

      const json = await res.json();
      if (!existingDesignId && json?.data?.id) setExistingDesignId(json.data.id);

      toast.success("Design saved!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save design");
    } finally {
      setSaving(false);
    }
  };

  // ── Canvas drag handling ──────────────────────────────
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;
    for (let i = currentDesign.elements.length - 1; i >= 0; i--) {
      const el = currentDesign.elements[i];
      if (
        x >= el.x - el.width / 2 &&
        x <= el.x + el.width / 2 &&
        y >= el.y - el.height / 2 &&
        y <= el.y + el.height / 2
      ) {
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
    const x = (e.clientX - rect.left) / zoom - dragging.offsetX;
    const y = (e.clientY - rect.top) / zoom - dragging.offsetY;
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
    if (dragging) {
      pushHistory(activeViewKey, currentDesign);
      setDragging(null);
    }
  };

  const handleCanvasTouchStart = (e: React.TouchEvent) => {
    if (!canvasRef.current || e.touches.length !== 1) return;
    const touch = e.touches[0];
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (touch.clientX - rect.left) / zoom;
    const y = (touch.clientY - rect.top) / zoom;
    for (let i = currentDesign.elements.length - 1; i >= 0; i--) {
      const el = currentDesign.elements[i];
      if (
        x >= el.x - el.width / 2 &&
        x <= el.x + el.width / 2 &&
        y >= el.y - el.height / 2 &&
        y <= el.y + el.height / 2
      ) {
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
    if (dragging) {
      pushHistory(activeViewKey, currentDesign);
      setDragging(null);
    }
  };

  // ── Mobile panel ──────────────────────────────────────
  const [mobilePanelOpenState, setMobilePanelOpenState] = useState(false);
  const handleMobileToolClick = (toolId: ToolType) => {
    if (activeTool === toolId && mobilePanelOpenState) setMobilePanelOpenState(false);
    else { setActiveTool(toolId); setMobilePanelOpenState(true); }
  };

  // ── Auto-fit zoom on mobile ───────────────────────────
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

  // ── Loading / error ───────────────────────────────────
  if (loading || viewsLoading) {
    return (
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 pt-32 md:pt-28 pb-12">
        <div className="flex items-center justify-center h-[60vh]">
          <div className="animate-pulse text-muted-foreground">Loading editor...</div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 pt-32 md:pt-28 pb-12 text-center py-20">
        <h1 className="text-2xl font-bold text-foreground">Product Not Found</h1>
        <Link href="/products" className="text-primary mt-4 inline-block">
          Back to Products
        </Link>
      </div>
    );
  }

  const mainImage =
    product.images.length > 0
      ? product.images.sort(
          (
            a: { isMain: boolean; sortOrder: number },
            b: { isMain: boolean; sortOrder: number }
          ) => (a.isMain ? -1 : b.isMain ? 1 : a.sortOrder - b.sortOrder)
        )[0]
      : null;

  const activeView = productViews.find((v) => v.viewKey === activeViewKey) ?? null;
  /**
   * Base image URL for the current view.
   * This is the static product photo — it is rendered BEHIND the canvas overlay
   * and is NEVER touched by user edits.
   */
  const baseImageUrl = activeView?.baseImageUrl ?? mainImage?.url ?? null;

  const canUndo = (historyIndexRef.current[activeViewKey] ?? 0) > 0;
  const canRedo =
    (historyIndexRef.current[activeViewKey] ?? 0) <
    ((historyRef.current[activeViewKey]?.length ?? 1) - 1);

  /** Views that have been edited (contain at least one element or a non-default background) */
  const editedViews = new Set(
    Object.entries(viewDesigns)
      .filter(([, d]) => d.elements.length > 0 || d.backgroundColor !== "#ffffff")
      .map(([k]) => k)
  );

  // ── Tool panel ────────────────────────────────────────
  const renderToolPanel = () => {
    switch (activeTool) {
      case "text":
        return (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Add Text</h3>
            <button
              onClick={addTextElement}
              className="w-full h-10 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition flex items-center justify-center gap-2"
            >
              <Type size={16} /> Add Text Block
            </button>

            {selectedElement?.type === "text" && (
              <div className="space-y-3 pt-3 border-t border-border">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Edit Text</h4>
                <textarea
                  value={selectedElement.text}
                  onChange={(e) => updateElement(selectedElement.id, { text: e.target.value })}
                  className="w-full h-20 bg-muted border border-border rounded-lg p-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <select
                  value={selectedElement.fontFamily}
                  onChange={(e) => updateElement(selectedElement.id, { fontFamily: e.target.value })}
                  className="w-full h-9 bg-muted border border-border rounded-lg px-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {FONT_FAMILIES.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={selectedElement.fontSize}
                    onChange={(e) => updateElement(selectedElement.id, { fontSize: Number(e.target.value) })}
                    min={8}
                    max={120}
                    className="w-20 h-9 bg-muted border border-border rounded-lg px-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button
                    onClick={() => updateElement(selectedElement.id, { fontWeight: selectedElement.fontWeight === "bold" ? "normal" : "bold" })}
                    className={`w-9 h-9 rounded-lg flex items-center justify-center transition ${selectedElement.fontWeight === "bold" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
                  >
                    <Bold size={14} />
                  </button>
                  <button
                    onClick={() => updateElement(selectedElement.id, { fontStyle: selectedElement.fontStyle === "italic" ? "normal" : "italic" })}
                    className={`w-9 h-9 rounded-lg flex items-center justify-center transition ${selectedElement.fontStyle === "italic" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
                  >
                    <Italic size={14} />
                  </button>
                </div>
                <div className="flex gap-1">
                  {(["left", "center", "right"] as const).map((align) => (
                    <button
                      key={align}
                      onClick={() => updateElement(selectedElement.id, { textAlign: align })}
                      className={`flex-1 h-9 rounded-lg flex items-center justify-center transition ${selectedElement.textAlign === align ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
                    >
                      {align === "left" ? <AlignLeft size={14} /> : align === "center" ? <AlignCenter size={14} /> : <AlignRight size={14} />}
                    </button>
                  ))}
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Color</label>
                  <div className="flex flex-wrap gap-1.5">
                    {COLORS.slice(0, 12).map((color) => (
                      <button
                        key={color}
                        onClick={() => updateElement(selectedElement.id, { color })}
                        className={`w-7 h-7 rounded-md border-2 transition ${selectedElement.color === color ? "border-primary scale-110" : "border-border"}`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case "image":
        return (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Upload Logo / Image</h3>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/svg+xml,image/webp"
              className="hidden"
              onChange={handleFileUpload}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-24 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary hover:text-primary transition cursor-pointer"
            >
              <Upload size={24} />
              <span className="text-xs">PNG, JPEG, SVG, WebP (max 5MB)</span>
            </button>
            {selectedElement?.type === "image" && (
              <div className="space-y-3 pt-3 border-t border-border">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Resize</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-muted-foreground">Width</label>
                    <input
                      type="number"
                      value={Math.round(selectedElement.width)}
                      onChange={(e) => updateElement(selectedElement.id, { width: Number(e.target.value) })}
                      min={20}
                      className="w-full h-8 bg-muted border border-border rounded-lg px-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Height</label>
                    <input
                      type="number"
                      value={Math.round(selectedElement.height)}
                      onChange={(e) => updateElement(selectedElement.id, { height: Number(e.target.value) })}
                      min={20}
                      className="w-full h-8 bg-muted border border-border rounded-lg px-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Rotation</label>
                  <input
                    type="range"
                    value={selectedElement.rotation}
                    onChange={(e) => updateElement(selectedElement.id, { rotation: Number(e.target.value) })}
                    min={0}
                    max={360}
                    className="w-full accent-primary"
                  />
                  <span className="text-xs text-muted-foreground">{selectedElement.rotation}°</span>
                </div>
              </div>
            )}
          </div>
        );

      case "color":
        return (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Canvas Background</h3>
            <p className="text-xs text-muted-foreground">
              Changes the overlay canvas colour for the{" "}
              <span className="font-semibold text-foreground">{activeView?.name ?? "current"}</span>{" "}
              view only. The product base image is always preserved.
            </p>
            <div>
              <label className="text-xs text-muted-foreground mb-2 block">Color</label>
              <div className="flex flex-wrap gap-2">
                {COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => updateDesign((prev) => ({ ...prev, backgroundColor: color }))}
                    className={`w-8 h-8 rounded-lg border-2 transition ${currentDesign.backgroundColor === color ? "border-primary scale-110 shadow-md" : "border-border"}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <div className="mt-3 flex items-center gap-2">
                <label className="text-xs text-muted-foreground">Custom:</label>
                <input
                  type="color"
                  value={currentDesign.backgroundColor}
                  onChange={(e) => updateDesign((prev) => ({ ...prev, backgroundColor: e.target.value }))}
                  className="w-8 h-8 rounded cursor-pointer border border-border"
                />
                <span className="text-xs text-muted-foreground font-mono">{currentDesign.backgroundColor}</span>
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-2 block">Pattern</label>
              <div className="grid grid-cols-2 gap-2">
                {PATTERNS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => updateDesign((prev) => ({ ...prev, backgroundPattern: p.id === "none" ? null : p.id }))}
                    className={`h-9 rounded-lg text-xs font-medium transition ${
                      (currentDesign.backgroundPattern ?? "none") === p.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case "qr":
        return (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">QR Code</h3>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">URL or Text</label>
              <input
                type="text"
                value={qrInput}
                onChange={(e) => setQrInput(e.target.value)}
                placeholder="https://example.com"
                className="w-full h-9 bg-muted border border-border rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="flex items-center justify-center p-4 bg-muted rounded-xl">
              <QRCodeSVG data={qrInput || "https://pac8.store"} color="#1a1a1a" size={120} />
            </div>
            <button
              onClick={() => addQRElement(qrInput || "https://pac8.store")}
              disabled={!qrInput}
              className="w-full h-10 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition disabled:opacity-50"
            >
              Add QR Code to Canvas
            </button>
            {selectedElement?.type === "qr" && (
              <div className="space-y-3 pt-3 border-t border-border">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">QR Settings</h4>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">QR Color</label>
                  <div className="flex flex-wrap gap-1.5">
                    {["#1a1a1a", "#374151", "#7c3aed", "#2563eb", "#059669", "#ef4444"].map((color) => (
                      <button
                        key={color}
                        onClick={() => updateElement(selectedElement.id, { color })}
                        className={`w-7 h-7 rounded-md border-2 transition ${selectedElement.color === color ? "border-primary scale-110" : "border-border"}`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Size</label>
                  <input
                    type="range"
                    value={selectedElement.width}
                    onChange={(e) => {
                      const size = Number(e.target.value);
                      updateElement(selectedElement.id, { width: size, height: size });
                    }}
                    min={60}
                    max={200}
                    className="w-full accent-primary"
                  />
                </div>
              </div>
            )}
          </div>
        );

      case "finish":
        return (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Finish Options</h3>
            <div className="space-y-2">
              {FINISH_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => updateDesign((prev) => ({ ...prev, finish: opt.id }))}
                  className={`w-full text-left p-3 rounded-xl border-2 transition ${
                    currentDesign.finish === opt.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-muted-foreground"
                  }`}
                >
                  <p className="text-sm font-medium text-foreground">{opt.name}</p>
                  <p className="text-xs text-muted-foreground">{opt.description}</p>
                </button>
              ))}
            </div>
          </div>
        );

      case "template":
        return (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Templates</h3>
            <p className="text-xs text-muted-foreground">
              Applied to the{" "}
              <span className="font-semibold text-foreground">{activeView?.name ?? "current"}</span>{" "}
              view only.
            </p>
            <div className="space-y-2">
              {TEMPLATES.map((tpl) => (
                <button
                  key={tpl.id}
                  onClick={() => applyTemplate(tpl)}
                  className="w-full text-left p-3 rounded-xl border border-border hover:border-primary transition group"
                >
                  <div className="w-full h-16 rounded-lg mb-2 border border-border" style={{ backgroundColor: tpl.backgroundColor }} />
                  <p className="text-sm font-medium text-foreground group-hover:text-primary transition">{tpl.name}</p>
                </button>
              ))}
            </div>
          </div>
        );

      default: // select
        return (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">
              {selectedElement ? "Element Properties" : "Select an Element"}
            </h3>
            {!selectedElement && (
              <p className="text-xs text-muted-foreground">
                Click an element on the canvas to select it, or use the tools to add new elements.
              </p>
            )}
            {selectedElement && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-muted-foreground">X</label>
                    <input
                      type="number"
                      value={Math.round(selectedElement.x)}
                      onChange={(e) => updateElement(selectedElement.id, { x: Number(e.target.value) })}
                      className="w-full h-8 bg-muted border border-border rounded-lg px-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Y</label>
                    <input
                      type="number"
                      value={Math.round(selectedElement.y)}
                      onChange={(e) => updateElement(selectedElement.id, { y: Number(e.target.value) })}
                      className="w-full h-8 bg-muted border border-border rounded-lg px-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => duplicateElement(selectedElement.id)}
                    className="flex-1 h-9 bg-muted text-muted-foreground rounded-lg text-xs font-medium hover:bg-muted/80 transition flex items-center justify-center gap-1"
                  >
                    <Copy size={13} /> Duplicate
                  </button>
                  <button
                    onClick={() => deleteElement(selectedElement.id)}
                    className="flex-1 h-9 bg-red-50 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100 transition flex items-center justify-center gap-1"
                  >
                    <Trash2 size={13} /> Delete
                  </button>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Rotation</label>
                  <input
                    type="range"
                    value={selectedElement.rotation}
                    onChange={(e) => updateElement(selectedElement.id, { rotation: Number(e.target.value) })}
                    min={0}
                    max={360}
                    className="w-full accent-primary"
                  />
                  <span className="text-xs text-muted-foreground">{selectedElement.rotation}°</span>
                </div>
              </div>
            )}
          </div>
        );
    }
  };

  // ── Canvas element renderer ────────────────────────────
  const renderElement = (el: DesignElement) => {
    const isSelected = el.id === selectedElementId;
    const baseStyle: React.CSSProperties = {
      position: "absolute",
      left: el.x - el.width / 2,
      top: el.y - el.height / 2,
      width: el.width,
      height: el.height,
      transform: `rotate(${el.rotation}deg)`,
      cursor: "move",
      zIndex: isSelected ? 10 : 1,
    };

    return (
      <div
        key={el.id}
        style={baseStyle}
        className={`${isSelected ? "ring-2 ring-primary ring-offset-2" : ""}`}
        onMouseDown={(e) => {
          e.stopPropagation();
          setSelectedElementId(el.id);
          if (canvasRef.current) {
            const rect = canvasRef.current.getBoundingClientRect();
            const x = (e.clientX - rect.left) / zoom;
            const y = (e.clientY - rect.top) / zoom;
            setDragging({ elementId: el.id, offsetX: x - el.x, offsetY: y - el.y });
          }
        }}
      >
        {el.type === "text" && (
          <div
            style={{
              fontFamily: el.fontFamily,
              fontSize: el.fontSize,
              fontWeight: el.fontWeight,
              fontStyle: el.fontStyle,
              textAlign: el.textAlign,
              color: el.color,
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent:
                el.textAlign === "center" ? "center" : el.textAlign === "right" ? "flex-end" : "flex-start",
              userSelect: "none",
              lineHeight: 1.2,
              whiteSpace: "pre-wrap",
              overflow: "hidden",
            }}
          >
            {el.text}
          </div>
        )}
        {el.type === "image" && (
          <Image
            src={el.src}
            alt="Design element"
            width={el.width}
            height={el.height}
            className="w-full h-full object-contain pointer-events-none"
            unoptimized
          />
        )}
        {el.type === "qr" && <QRCodeSVG data={el.data} color={el.color} size={el.width} />}
      </div>
    );
  };

  // ── View selector strip ───────────────────────────────
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
            <button
              key={view.viewKey}
              onClick={() => switchView(view.viewKey)}
              title={view.description ?? view.name}
              className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 transition border ${
                isActive
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-card text-muted-foreground border-border hover:border-primary hover:text-foreground"
              }`}
            >
              {/* Thumbnail of the view's base image */}
              <div className="w-6 h-6 rounded overflow-hidden bg-muted shrink-0">
                <Image
                  src={view.baseImageUrl}
                  alt={view.name}
                  width={24}
                  height={24}
                  className="w-full h-full object-cover"
                  unoptimized
                />
              </div>
              {view.name}
              {hasEdits && (
                <CheckCircle2 size={12} className={isActive ? "text-primary-foreground/80" : "text-primary"} />
              )}
            </button>
          );
        })}
      </div>
    );
  };

  // ── Preview modal ─────────────────────────────────────
  const PreviewModal = () => (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-bold text-foreground">Design Preview — All Views</h2>
          <button onClick={() => setShowPreview(false)} className="text-muted-foreground hover:text-foreground transition text-sm">
            Close
          </button>
        </div>
        <div className="p-6 space-y-6">
          {/* Product info */}
          <div className="flex items-center gap-4">
            {mainImage && (
              <div className="relative w-16 h-16 bg-muted rounded-xl overflow-hidden shrink-0">
                <Image src={mainImage.url} alt={product.name} fill className="object-contain" sizes="64px" />
              </div>
            )}
            <div>
              <h3 className="font-semibold text-foreground">{product.name}</h3>
              <p className="text-sm text-muted-foreground">{designName}</p>
            </div>
          </div>

          {/* Per-view previews */}
          {productViews.length === 0 ? (
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-2">Design Canvas</h4>
              <div
                className="relative mx-auto rounded-xl overflow-hidden border border-border shadow-lg"
                style={{
                  width: Math.min(currentDesign.canvasWidth, 550),
                  height: Math.min(currentDesign.canvasHeight, 370),
                  ...getPatternStyle(currentDesign.backgroundPattern, currentDesign.backgroundColor),
                }}
              >
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
                      {hasEdits && (
                        <span className="text-xs text-primary font-medium flex items-center gap-1">
                          <CheckCircle2 size={11} /> Edited
                        </span>
                      )}
                    </div>
                    {/* Base product image (always preserved) */}
                    <div className="relative rounded-xl overflow-hidden border border-border shadow bg-muted" style={{ aspectRatio: "3/2" }}>
                      <Image src={view.baseImageUrl} alt={view.name} fill className="object-contain" sizes="300px" />
                      {/* Canvas overlay elements */}
                      {vd && vd.elements.length > 0 && (
                        <div
                          className="absolute inset-0 pointer-events-none"
                          style={{
                            ...getPatternStyle(vd.backgroundPattern, vd.backgroundColor),
                            opacity: vd.backgroundColor === "#ffffff" && !vd.backgroundPattern ? 0 : 0.85,
                          }}
                        >
                          <div
                            style={{
                              position: "relative",
                              width: vd.canvasWidth,
                              height: vd.canvasHeight,
                              transform: "scale(0.45)",
                              transformOrigin: "top left",
                            }}
                          >
                            {vd.elements.map(renderElement)}
                          </div>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {vd?.elements.length ?? 0} element(s) · {vd?.finish ?? "matte"} finish
                    </p>
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex gap-3 justify-end pt-4 border-t border-border">
            <button
              onClick={() => setShowPreview(false)}
              className="h-10 px-4 bg-muted text-muted-foreground rounded-lg text-sm font-medium hover:bg-muted/80 transition"
            >
              Continue Editing
            </button>
            <button
              onClick={async () => { await saveDesign(); setShowPreview(false); }}
              disabled={saving}
              className="h-10 px-6 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Design"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // ── Main render ───────────────────────────────────────
  return (
    <>
      <main className="flex-1 pt-20 md:pt-24">
        {/* Top toolbar */}
        <div className="bg-card border-b border-border px-4 sm:px-6 py-3">
          <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <Link
                href={`/products/${slug}`}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition shrink-0"
              >
                <ChevronLeft size={16} /> Back
              </Link>
              <div className="h-5 w-px bg-border shrink-0" />
              <input
                type="text"
                value={designName}
                onChange={(e) => setDesignName(e.target.value)}
                className="text-sm font-semibold text-foreground bg-transparent border-none outline-none min-w-0 truncate focus:ring-0"
                placeholder="Design name..."
              />
            </div>

            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              {/* Undo / Redo (per-view history) */}
              <button
                onClick={undo}
                disabled={!canUndo}
                title="Undo"
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted disabled:opacity-30 transition text-muted-foreground"
              >
                <Undo2 size={16} />
              </button>
              <button
                onClick={redo}
                disabled={!canRedo}
                title="Redo"
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted disabled:opacity-30 transition text-muted-foreground"
              >
                <Redo2 size={16} />
              </button>

              {/* Zoom */}
              <div className="hidden sm:flex items-center gap-1">
                <div className="h-5 w-px bg-border" />
                <button
                  onClick={() => setZoom((z) => Math.max(0.5, z - 0.1))}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted transition text-muted-foreground"
                >
                  <ZoomOut size={16} />
                </button>
                <span className="text-xs text-muted-foreground w-10 text-center">{Math.round(zoom * 100)}%</span>
                <button
                  onClick={() => setZoom((z) => Math.min(2, z + 0.1))}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted transition text-muted-foreground"
                >
                  <ZoomIn size={16} />
                </button>
              </div>

              <div className="h-5 w-px bg-border" />

              <button
                onClick={() => setShowPreview(true)}
                className="h-9 w-9 sm:w-auto sm:px-3 bg-muted text-muted-foreground rounded-lg text-sm font-medium hover:bg-muted/80 transition flex items-center justify-center gap-1.5"
              >
                <Eye size={15} />
                <span className="hidden sm:inline">Preview</span>
              </button>
              <button
                onClick={saveDesign}
                disabled={saving}
                className="h-9 w-9 sm:w-auto sm:px-3 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <Save size={15} />
                <span className="hidden sm:inline">{saving ? "Saving..." : "Save Draft"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Editor body */}
        <div className="flex flex-1 relative" style={{ height: "calc(100vh - 180px)" }}>
          {/* Left: Tool strip (desktop) */}
          <div className="hidden md:flex w-14 bg-card border-r border-border flex-col items-center py-3 gap-1 shrink-0">
            {[
              { id: "select" as ToolType, icon: Move, label: "Select" },
              { id: "text" as ToolType, icon: Type, label: "Text" },
              { id: "image" as ToolType, icon: ImageIcon, label: "Image" },
              { id: "color" as ToolType, icon: Palette, label: "Background" },
              { id: "qr" as ToolType, icon: QrCode, label: "QR Code" },
              { id: "finish" as ToolType, icon: Sparkles, label: "Finish" },
              { id: "template" as ToolType, icon: LayoutTemplate, label: "Templates" },
            ].map((tool) => (
              <button
                key={tool.id}
                onClick={() => setActiveTool(tool.id)}
                title={tool.label}
                className={`w-10 h-10 rounded-lg flex items-center justify-center transition ${
                  activeTool === tool.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
                }`}
              >
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
            {/* View selector strip — tabs for each product side */}
            <ViewSelector />

            {/* Canvas scroll area */}
            <div className="flex-1 bg-muted/50 overflow-auto flex items-center justify-center relative pb-16 md:pb-0">
              <div
                ref={canvasRef}
                className="relative rounded-lg shadow-xl overflow-hidden touch-none"
                style={{
                  width: currentDesign.canvasWidth * zoom,
                  height: currentDesign.canvasHeight * zoom,
                  ...getPatternStyle(currentDesign.backgroundPattern, currentDesign.backgroundColor),
                }}
                onMouseDown={handleCanvasMouseDown}
                onMouseMove={handleCanvasMouseMove}
                onMouseUp={handleCanvasMouseUp}
                onMouseLeave={handleCanvasMouseUp}
                onTouchStart={handleCanvasTouchStart}
                onTouchMove={handleCanvasTouchMove}
                onTouchEnd={handleCanvasTouchEnd}
              >
                {/*
                  ┌──────────────────────────────────────────────────────┐
                  │  BASE IMAGE LAYER (z-index 0, pointer-events: none)  │
                  │  This is the product's own photo for this view.      │
                  │  It is NEVER modified by user interactions.           │
                  └──────────────────────────────────────────────────────┘
                */}
                {baseImageUrl && (
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{ zIndex: 0 }}
                  >
                    <Image
                      src={baseImageUrl}
                      alt={activeView?.name ?? product.name}
                      fill
                      className="object-contain"
                      sizes={`${currentDesign.canvasWidth}px`}
                      priority
                      unoptimized
                    />
                  </div>
                )}

                {/*
                  ┌──────────────────────────────────────────────────────┐
                  │  DESIGN OVERLAY LAYER (z-index 1+)                   │
                  │  User-placed elements for the ACTIVE view only.      │
                  │  Stored independently per view and per user.         │
                  └──────────────────────────────────────────────────────┘
                */}
                <div
                  style={{
                    transform: `scale(${zoom})`,
                    transformOrigin: "top left",
                    width: currentDesign.canvasWidth,
                    height: currentDesign.canvasHeight,
                    position: "relative",
                    zIndex: 1,
                  }}
                >
                  {currentDesign.elements.map(renderElement)}
                </div>
              </div>
            </div>
          </div>

          {/* Right panel: Product info + views + layers (xl only) */}
          <div className="w-64 bg-card border-l border-border p-4 overflow-y-auto shrink-0 hidden xl:block">
            <h3 className="text-sm font-semibold text-foreground mb-3">Product</h3>
            {mainImage && (
              <div className="relative w-full aspect-square bg-muted rounded-xl overflow-hidden mb-3">
                <Image src={mainImage.url} alt={product.name} fill className="object-contain" sizes="240px" />
                <div className="absolute bottom-1 right-1 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded">
                  Base image
                </div>
              </div>
            )}
            <h4 className="text-sm font-medium text-foreground">{product.name}</h4>
            <p className="text-xs text-muted-foreground mt-1">₦{product.price.toLocaleString()}</p>
            {product.printPrice && (
              <p className="text-xs text-primary mt-1">+₦{product.printPrice.toLocaleString()} print fee</p>
            )}

            {/* Views list */}
            {productViews.length > 0 && (
              <div className="border-t border-border mt-4 pt-4">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Views
                </h3>
                <div className="space-y-1.5">
                  {productViews.map((view) => (
                    <button
                      key={view.viewKey}
                      onClick={() => switchView(view.viewKey)}
                      className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs transition ${
                        view.viewKey === activeViewKey
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      <div className="w-8 h-8 rounded overflow-hidden bg-muted shrink-0">
                        <Image
                          src={view.baseImageUrl}
                          alt={view.name}
                          width={32}
                          height={32}
                          className="w-full h-full object-cover"
                          unoptimized
                        />
                      </div>
                      <span className="truncate flex-1">{view.name}</span>
                      {editedViews.has(view.viewKey) && (
                        <CheckCircle2 size={12} className="shrink-0 text-primary" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Layers for current view */}
            <div className="border-t border-border mt-4 pt-4">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Layers — {activeView?.name ?? "Canvas"}
              </h3>
              {currentDesign.elements.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">No elements yet</p>
              ) : (
                <div className="space-y-1">
                  {[...currentDesign.elements].reverse().map((el) => (
                    <button
                      key={el.id}
                      onClick={() => setSelectedElementId(el.id)}
                      className={`w-full text-left px-2 py-1.5 rounded-lg text-xs flex items-center gap-2 transition ${
                        el.id === selectedElementId ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {el.type === "text" ? <Type size={12} /> : el.type === "image" ? <ImageIcon size={12} /> : <QrCode size={12} />}
                      <span className="truncate">
                        {el.type === "text"
                          ? (el as TextElement).text.slice(0, 20)
                          : el.type === "image"
                          ? "Image"
                          : "QR Code"}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Design summary */}
            <div className="border-t border-border mt-4 pt-4">
              <h3 className="text-sm font-semibold text-foreground mb-2">Design Summary</h3>
              <div className="space-y-2 text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span>Elements (this view)</span>
                  <span className="font-medium text-foreground">{currentDesign.elements.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Views edited</span>
                  <span className="font-medium text-foreground">
                    {editedViews.size} / {productViews.length || 1}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Finish</span>
                  <span className="font-medium text-foreground capitalize">{currentDesign.finish}</span>
                </div>
                <div className="flex justify-between">
                  <span>Canvas</span>
                  <span className="font-medium text-foreground">
                    {currentDesign.canvasWidth} × {currentDesign.canvasHeight}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile: Bottom tool bar */}
          <div className="md:hidden fixed bottom-0 left-0 right-0 z-30">
            {mobilePanelOpenState && (
              <div className="bg-card border-t border-border max-h-[50vh] overflow-y-auto px-4 py-3 shadow-lg">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-foreground capitalize">{activeTool}</h3>
                  <button
                    onClick={() => setMobilePanelOpenState(false)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted transition text-muted-foreground"
                  >
                    <X size={16} />
                  </button>
                </div>
                {renderToolPanel()}
              </div>
            )}
            <div className="bg-card border-t border-border px-2 py-2 flex items-center justify-around gap-1">
              {[
                { id: "select" as ToolType, icon: Move, label: "Select" },
                { id: "text" as ToolType, icon: Type, label: "Text" },
                { id: "image" as ToolType, icon: ImageIcon, label: "Image" },
                { id: "color" as ToolType, icon: Palette, label: "Color" },
                { id: "qr" as ToolType, icon: QrCode, label: "QR" },
                { id: "finish" as ToolType, icon: Sparkles, label: "Finish" },
                { id: "template" as ToolType, icon: LayoutTemplate, label: "Template" },
              ].map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => handleMobileToolClick(tool.id)}
                  className={`flex flex-col items-center justify-center gap-0.5 py-1.5 px-2 rounded-lg transition min-w-0 ${
                    activeTool === tool.id ? "bg-primary/10 text-primary" : "text-muted-foreground"
                  }`}
                >
                  <tool.icon size={18} />
                  <span className="text-[10px] leading-tight truncate">{tool.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>

      {showPreview && <PreviewModal />}
    </>
  );
}
