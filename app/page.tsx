"use client";

import emojiOptions from "unicode-emoji-json/data-ordered-emoji.json";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Code2,
  Copy,
  Download,
  FolderUp,
  ImageDown,
  LayoutDashboard,
  Link as LinkIcon,
  Palette,
  Redo2,
  RotateCcw,
  Search,
  Sparkles,
  Undo2,
  X,
} from "lucide-react";
import { icons, type LucideIcon } from "lucide-react";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type ReactNode,
  type SetStateAction,
} from "react";

const gradientPresets = [
  ["#8E2DE2", "#4A00E0"],
  ["#99F2C8", "#1F4037"],
  ["#F953C6", "#B91D73"],
  ["#91EAE4", "#7F7FD5"],
  ["#F5AF19", "#F12711"],
  ["#EAAFC8", "#EC2F4B"],
  ["#FF7DB4", "#654EA3"],
  ["#00B4DB", "#003357"],
  ["#A8C0FF", "#3F2B96"],
  ["#DD1818", "#380202"],
  ["#DECBA4", "#3E5151"],
  ["#FC466B", "#3F5EFB"],
  ["#CCCFE2", "#25242B"],
  ["#68AEFF", "#003EB7"],
  ["#C9D6FF", "#596AA1"],
  ["#5C5C5C", "#0F1015"],
] as const;

const allEmojiOptions = emojiOptions as string[];

const fontFamilies = [
  "sans-serif",
  "serif",
  "monospace",
  "cursive",
  "fantasy",
  "system-ui",
  "math",
  "fangsong",
];

type SourceType = "svg" | "text" | "local";
type FillType = "Linear" | "Solid";

type StudioState = {
  filename: string;
  type: SourceType;
  value: string;
  totalSize: number;
  animate: boolean;
  fillStyle: {
    fillType: FillType;
    primaryColor: string;
    secondaryColor: string;
    angle: number;
    clip: boolean;
  };
  background: {
    radialGlare: boolean;
    noiseTexture: boolean;
    noiseOpacity: number;
    radius: number;
    strokeSize: number;
    strokeColor: string;
    strokeOpacity: number;
  };
  icon: {
    color: string;
    size: number;
    family: string;
  };
};

type EditorSnapshot = {
  state: StudioState;
  localSvgData: string;
};

const initialState: StudioState = {
  filename: "export-icon",
  type: "svg",
  value: "Sparkles",
  totalSize: 256,
  animate: false,
  fillStyle: {
    fillType: "Linear",
    primaryColor: "#FC466B",
    secondaryColor: "#3F5EFB",
    angle: 45,
    clip: false,
  },
  background: {
    radialGlare: false,
    noiseTexture: false,
    noiseOpacity: 50,
    radius: 64,
    strokeSize: 0,
    strokeColor: "#FFFFFF",
    strokeOpacity: 100,
  },
  icon: {
    color: "#FFFFFF",
    size: 128,
    family: "sans-serif",
  },
};

export default function Page() {
  const [state, setRawState] = useState<StudioState>(initialState);
  const [query, setQuery] = useState("");
  const [iconPage, setIconPage] = useState(1);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [menu, setMenu] = useState<"api" | "export" | null>(null);
  const [exportModal, setExportModal] = useState(false);
  const [exportSvg, setExportSvg] = useState(true);
  const [exportPng, setExportPng] = useState(false);
  const [localSvgData, setRawLocalSvgData] = useState("");
  const [notice, setNotice] = useState("");
  const [mobilePanel, setMobilePanel] = useState<"left" | "right" | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const noticeTimer = useRef<number | undefined>(undefined);
  const stateRef = useRef<StudioState>(initialState);
  const localSvgDataRef = useRef("");
  const pastRef = useRef<EditorSnapshot[]>([]);
  const futureRef = useRef<EditorSnapshot[]>([]);
  const perPage = 40;

  const flash = (message: string) => {
    setNotice(message);
    if (noticeTimer.current) window.clearTimeout(noticeTimer.current);
    noticeTimer.current = window.setTimeout(() => setNotice(""), 1800);
  };

  const commitSnapshot = (nextState: StudioState, nextLocalSvgData = localSvgDataRef.current) => {
    const currentState = stateRef.current;
    const currentLocalSvgData = localSvgDataRef.current;
    const stateChanged = JSON.stringify(currentState) !== JSON.stringify(nextState);
    const localChanged = currentLocalSvgData !== nextLocalSvgData;
    if (!stateChanged && !localChanged) return;

    pastRef.current = [
      ...pastRef.current.slice(-99),
      { state: currentState, localSvgData: currentLocalSvgData },
    ];
    futureRef.current = [];
    stateRef.current = nextState;
    localSvgDataRef.current = nextLocalSvgData;
    setRawState(nextState);
    if (localChanged) setRawLocalSvgData(nextLocalSvgData);
  };

  const setState = (action: SetStateAction<StudioState>) => {
    const previous = stateRef.current;
    const next = typeof action === "function"
      ? (action as (prev: StudioState) => StudioState)(previous)
      : action;
    commitSnapshot(next);
  };

  const restoreSnapshot = (snapshot: EditorSnapshot) => {
    stateRef.current = snapshot.state;
    localSvgDataRef.current = snapshot.localSvgData;
    setRawState(snapshot.state);
    setRawLocalSvgData(snapshot.localSvgData);
  };

  const undo = () => {
    const previous = pastRef.current.pop();
    if (!previous) return;
    futureRef.current.push({ state: stateRef.current, localSvgData: localSvgDataRef.current });
    restoreSnapshot(previous);
    flash("Undone");
  };

  const redo = () => {
    const next = futureRef.current.pop();
    if (!next) return;
    pastRef.current.push({ state: stateRef.current, localSvgData: localSvgDataRef.current });
    restoreSnapshot(next);
    flash("Redone");
  };

  const resetAll = () => {
    commitSnapshot(initialState, "");
    setQuery("");
    setIconPage(1);
    setEmojiOpen(false);
    setMenu(null);
    setExportModal(false);
    setExportSvg(true);
    setExportPng(false);
    setMobilePanel(null);
    flash("Reset all settings");
  };

  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    if (!sp.toString()) return;

    const numberParam = (key: string, fallback: number) => {
      const raw = Number(sp.get(key));
      return Number.isFinite(raw) ? raw : fallback;
    };

    setRawState((prev) => {
      const next: StudioState = {
        ...prev,
        filename: sp.get("filename") || prev.filename,
        type: sp.get("type") === "text" ? "text" : "svg",
        value: sp.get("value") || prev.value,
        totalSize: numberParam("totalSize", prev.totalSize),
        animate: sp.get("animate") === "true",
        fillStyle: {
          fillType: sp.get("fillType") === "Solid" ? "Solid" : "Linear",
          primaryColor: safeHex(sp.get("primaryColor"), prev.fillStyle.primaryColor),
          secondaryColor: safeHex(sp.get("secondaryColor"), prev.fillStyle.secondaryColor),
          angle: numberParam("angle", prev.fillStyle.angle),
          clip: sp.get("clip") === "true",
        },
        background: {
          radialGlare: sp.get("radialGlare") === "true",
          noiseTexture: sp.get("noiseTexture") === "true",
          noiseOpacity: numberParam("noiseOpacity", prev.background.noiseOpacity),
          radius: numberParam("radius", prev.background.radius),
          strokeSize: numberParam("strokeSize", prev.background.strokeSize),
          strokeColor: safeHex(sp.get("strokeColor"), prev.background.strokeColor),
          strokeOpacity: numberParam("strokeOpacity", prev.background.strokeOpacity),
        },
        icon: {
          color: safeHex(sp.get("color"), prev.icon.color),
          size: numberParam("size", prev.icon.size),
          family: sp.get("family") || prev.icon.family,
        },
      };
      stateRef.current = next;
      return next;
    });
  }, []);

  useEffect(() => setIconPage(1), [query]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const editingText = target?.tagName === "INPUT" || target?.tagName === "TEXTAREA" || target?.tagName === "SELECT" || target?.isContentEditable;
      if (editingText) return;
      if (!(event.ctrlKey || event.metaKey)) return;

      const key = event.key.toLowerCase();
      if (key === "z" && !event.shiftKey) {
        event.preventDefault();
        undo();
      } else if ((key === "z" && event.shiftKey) || key === "y") {
        event.preventDefault();
        redo();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const iconNames = useMemo(() => {
    const all = Object.keys(icons)
      .filter((name) => /^[A-Z]/.test(name))
      .filter((name) => name !== "Icon" && name !== "LucideIcon")
      .sort((a, b) => a.localeCompare(b));
    const q = query.trim().toLowerCase();
    return q ? all.filter((name) => name.toLowerCase().includes(q)) : all;
  }, [query]);

  const pageCount = Math.max(1, Math.ceil(iconNames.length / perPage));
  const visibleIcons = iconNames.slice((iconPage - 1) * perPage, iconPage * perPage);
  const ActiveIcon = state.type === "svg"
    ? (icons[state.value as keyof typeof icons] as LucideIcon | undefined)
    : undefined;
  const canUndo = pastRef.current.length > 0;
  const canRedo = futureRef.current.length > 0;

  const serialize = () => {
    if (!svgRef.current) return "";
    return new XMLSerializer().serializeToString(svgRef.current);
  };

  const buildParams = () => {
    if (state.type === "local") return null;
    return new URLSearchParams({
      filename: state.filename,
      type: state.type,
      value: state.value,
      totalSize: String(state.totalSize),
      animate: String(state.animate),
      fillType: state.fillStyle.fillType,
      primaryColor: state.fillStyle.primaryColor,
      secondaryColor: state.fillStyle.secondaryColor,
      angle: String(state.fillStyle.angle),
      clip: String(state.fillStyle.clip),
      radialGlare: String(state.background.radialGlare),
      noiseTexture: String(state.background.noiseTexture),
      noiseOpacity: String(state.background.noiseOpacity),
      radius: String(state.background.radius),
      strokeSize: String(state.background.strokeSize),
      strokeColor: state.background.strokeColor,
      strokeOpacity: String(state.background.strokeOpacity),
      color: state.icon.color,
      size: String(state.icon.size),
      family: state.icon.family,
    });
  };

  const getShareUrl = () => {
    const params = buildParams();
    if (!params) return "";
    return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
  };

  const getApiUrl = () => {
    const params = buildParams();
    if (!params) return "";
    return `${window.location.origin}/api/svg?${params.toString()}`;
  };

  const copyText = async (value: string, success: string) => {
    if (!value) {
      flash("Local SVG cannot generate a share/API URL");
      return;
    }
    await navigator.clipboard.writeText(value);
    flash(success);
  };

  const copySvg = async () => {
    const svg = serialize();
    if (!svg) return;
    await copyText(svg, "Copied SVG to clipboard");
  };

  const svgToPngBlob = async () => {
    const svg = serialize();
    if (!svg) return null;
    const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    try {
      const image = new Image();
      const loaded = new Promise<void>((resolve, reject) => {
        image.onload = () => resolve();
        image.onerror = () => reject(new Error("Failed to render SVG"));
      });
      image.src = url;
      await loaded;

      const canvas = document.createElement("canvas");
      canvas.width = state.totalSize;
      canvas.height = state.totalSize;
      const ctx = canvas.getContext("2d");
      if (!ctx) return null;
      ctx.drawImage(image, 0, 0, state.totalSize, state.totalSize);
      return await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
    } finally {
      URL.revokeObjectURL(url);
    }
  };

  const downloadSvg = () => {
    const svg = serialize();
    if (!svg) return;
    const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `${state.filename || "export-icon"}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadPng = async () => {
    const png = await svgToPngBlob();
    if (!png) return;
    const url = URL.createObjectURL(png);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${state.filename || "export-icon"}.png`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyImage = async () => {
    try {
      const png = await svgToPngBlob();
      if (!png || !("ClipboardItem" in window)) {
        flash("Image clipboard is not supported in this browser");
        return;
      }
      await navigator.clipboard.write([new ClipboardItem({ "image/png": png })]);
      flash("Copied image to clipboard");
    } catch {
      flash("Unable to copy image in this browser");
    }
  };

  const exportSelected = async () => {
    if (exportSvg) downloadSvg();
    if (exportPng) await downloadPng();
    setExportModal(false);
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result || "");
      if (!/<svg[\s\S]*<\/svg>/i.test(text)) {
        flash("Invalid SVG file");
        return;
      }
      const data = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(text)}`;
      commitSnapshot({ ...stateRef.current, type: "local", value: file.name }, data);
      flash("Local SVG loaded");
    };
    reader.readAsText(file);
  };

  const leftPanel = (
    <div className="left-tools">
      <div className="source-row">
        <input
          className="text-icon-input"
          placeholder="Input text icon"
          value={state.type === "text" ? state.value : ""}
          onChange={(e) => setState({ ...state, type: "text", value: e.target.value })}
        />
        <div className="emoji-wrap">
          <button className="icon-button emoji-button" onClick={() => setEmojiOpen((v) => !v)} aria-label="Choose emoji">😎</button>
          {emojiOpen && (
            <div className="emoji-popover" role="dialog" aria-label="All emoji">
              {allEmojiOptions.map((emoji, index) => (
                <button
                  key={`${emoji}-${index}`}
                  title={emoji}
                  onClick={() => {
                    setState({ ...state, type: "text", value: emoji });
                    setEmojiOpen(false);
                  }}>
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>
        <label className="icon-button upload-button" title="Upload local SVG">
          <input type="file" accept=".svg,image/svg+xml" onChange={handleFileChange} />
          <FolderUp size={17} />
        </label>
      </div>

      <label className="searchbox">
        <Search size={16} />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search Icons…" />
      </label>

      <div className="icon-grid">
        {visibleIcons.map((name) => {
          const Item = icons[name as keyof typeof icons] as LucideIcon;
          if (!Item) return null;
          return (
            <button
              key={name}
              title={name}
              className={state.type === "svg" && state.value === name ? "selected" : ""}
              onClick={() => setState({ ...state, type: "svg", value: name })}>
              <Item size={18} />
            </button>
          );
        })}
      </div>

      <div className="pager">
        <span>{iconPage} / {pageCount}</span>
        <button disabled={iconPage <= 1} onClick={() => setIconPage((p) => Math.max(1, p - 1))}><ChevronLeft size={16} /></button>
        <button disabled={iconPage >= pageCount} onClick={() => setIconPage((p) => Math.min(pageCount, p + 1))}><ChevronRight size={16} /></button>
      </div>
    </div>
  );

  const rightPanel = (
    <div className="right-tools">
      <AccordionSection title="Fill Styles" defaultOpen>
        <SelectRow
          label="Fill Type"
          value={state.fillStyle.fillType}
          options={["Linear", "Solid"]}
          onChange={(value) => setState({ ...state, fillStyle: { ...state.fillStyle, fillType: value as FillType } })}
        />
        <ColorRow label="Primary Color" value={state.fillStyle.primaryColor} onChange={(value) => setState({ ...state, fillStyle: { ...state.fillStyle, primaryColor: value } })} />
        <ColorRow label="Secondary Color" value={state.fillStyle.secondaryColor} disabled={state.fillStyle.fillType === "Solid"} onChange={(value) => setState({ ...state, fillStyle: { ...state.fillStyle, secondaryColor: value } })} />
        <NumberRow label="Angle" value={state.fillStyle.angle} unit="°" min={0} max={360} disabled={state.fillStyle.fillType === "Solid"} onChange={(value) => setState({ ...state, fillStyle: { ...state.fillStyle, angle: value } })} />
        <ToggleRow label={<span className="label-with-badge">Animate (svg)<b>Premium</b></span>} checked={state.animate} disabled={state.fillStyle.fillType === "Solid"} onChange={(checked) => setState({ ...state, animate: checked })} />
        <ToggleRow label="Clip (svg)" checked={state.fillStyle.clip} disabled={state.type !== "svg"} onChange={(checked) => setState({ ...state, fillStyle: { ...state.fillStyle, clip: checked } })} />
        <div className="preset-section">
          <span>Fill Presets</span>
          <div className="preset-grid">
            {gradientPresets.map(([a, b]) => (
              <button key={`${a}${b}`} title={`${a} → ${b}`} style={{ background: `linear-gradient(135deg, ${a}, ${b})` }} onClick={() => setState({ ...state, fillStyle: { ...state.fillStyle, fillType: "Linear", primaryColor: a, secondaryColor: b } })} />
            ))}
          </div>
        </div>
      </AccordionSection>

      <AccordionSection title="Background" defaultOpen>
        <ToggleRow label="Radial glare" checked={state.background.radialGlare} onChange={(checked) => setState({ ...state, background: { ...state.background, radialGlare: checked } })} />
        <ToggleRow label="Noise texture" checked={state.background.noiseTexture} onChange={(checked) => setState({ ...state, background: { ...state.background, noiseTexture: checked } })} />
        <SliderRow label="Noise Opacity" value={state.background.noiseOpacity} disabled={!state.background.noiseTexture} onChange={(value) => setState({ ...state, background: { ...state.background, noiseOpacity: value } })} />
      </AccordionSection>

      <AccordionSection title="Icon" defaultOpen>
        <ColorRow label="Color" value={state.icon.color} onChange={(value) => setState({ ...state, icon: { ...state.icon, color: value } })} />
        <SelectRow label="Font Family" value={state.icon.family} options={fontFamilies} onChange={(value) => setState({ ...state, icon: { ...state.icon, family: value } })} />
        <NumberRow label="Size" value={state.icon.size} unit="px" min={8} max={state.totalSize} onChange={(value) => setState({ ...state, icon: { ...state.icon, size: value } })} />
        <NumberRow label="Total Size" value={state.totalSize} unit="px" min={64} max={1024} onChange={(value) => setState({ ...state, totalSize: value, icon: { ...state.icon, size: Math.min(state.icon.size, value) } })} />
      </AccordionSection>

      <AccordionSection title="Border" defaultOpen>
        <NumberRow label="Stroke size" value={state.background.strokeSize} unit="px" min={0} max={64} onChange={(value) => setState({ ...state, background: { ...state.background, strokeSize: value } })} />
        <ColorRow label="Stroke Color" value={state.background.strokeColor} disabled={state.background.strokeSize === 0} onChange={(value) => setState({ ...state, background: { ...state.background, strokeColor: value } })} />
        <NumberRow label="Stroke opacity" value={state.background.strokeOpacity} unit="%" min={0} max={100} disabled={state.background.strokeSize === 0} onChange={(value) => setState({ ...state, background: { ...state.background, strokeOpacity: value } })} />
        <NumberRow label="Radius" value={state.background.radius} unit="px" min={0} max={state.totalSize / 2} onChange={(value) => setState({ ...state, background: { ...state.background, radius: value } })} />
      </AccordionSection>
    </div>
  );

  const shareUrl = typeof window !== "undefined" ? getShareUrl() : "";
  const apiUrl = typeof window !== "undefined" ? getApiUrl() : "";
  const svgCode = typeof window !== "undefined" ? serialize() : "";

  return (
    <main className="studio-shell">
      <header className="topbar">
        <div className="brand"><Sparkles size={19} /><span>Icon Studio</span></div>
        <input className="filename" value={state.filename} maxLength={100} onChange={(e) => setState({ ...state, filename: e.target.value })} aria-label="Filename" />
        <div className="top-actions">
          <div className="history-actions" aria-label="Editor history">
            <button disabled={!canUndo} onClick={undo} title="Undo"><Undo2 size={16} /></button>
            <button disabled={!canRedo} onClick={redo} title="Redo"><Redo2 size={16} /></button>
            <button onClick={resetAll} title="Reset all"><RotateCcw size={16} /></button>
          </div>

          <div className="menu-wrap">
            <button className="top-link" onClick={() => setMenu(menu === "api" ? null : "api")}>API</button>
            {menu === "api" && (
              <div className="dropdown-menu api-menu">
                <button onClick={() => { if (apiUrl) window.open(apiUrl, "_blank"); else flash("Local SVG has no API URL"); setMenu(null); }}><LinkIcon size={15} /> Preview</button>
                <button onClick={() => { void copyText(apiUrl ? `<img src=\"${apiUrl}\" alt=\"logo\"/>` : "", "Copied HTML code"); setMenu(null); }}><Code2 size={15} /> HTML Code</button>
                <button onClick={() => { void copyText(apiUrl ? `![logo](${apiUrl})` : "", "Copied Markdown code"); setMenu(null); }}><Copy size={15} /> Markdown</button>
                <button onClick={() => { void copyText(apiUrl, "Copied API URL"); setMenu(null); }}><Copy size={15} /> API URL</button>
              </div>
            )}
          </div>

          <div className="menu-wrap">
            <button className="export-button" onClick={() => setMenu(menu === "export" ? null : "export")}><Download size={15} /> Export</button>
            {menu === "export" && (
              <div className="dropdown-menu export-menu">
                <button onClick={() => { setExportModal(true); setMenu(null); }}><ImageDown size={15} /> Download</button>
                <button onClick={() => { void copySvg(); setMenu(null); }}><Copy size={15} /> Copy SVG</button>
                <button onClick={() => { void copyImage(); setMenu(null); }}><Copy size={15} /> Copy Image</button>
                <button onClick={() => { void copyText(shareUrl, "Copied share link"); setMenu(null); }}><LinkIcon size={15} /> Share Link</button>
              </div>
            )}
          </div>
        </div>
      </header>

      <section className="workspace">
        <aside className="floating-panel left-panel">{leftPanel}</aside>

        <section className="preview-stage">
          <div className="preview-wrap" style={{ width: state.totalSize, height: state.totalSize }}>
            <svg ref={svgRef} width={state.totalSize} height={state.totalSize} viewBox={`0 0 ${state.totalSize} ${state.totalSize}`} xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="studio-gradient" gradientTransform={`rotate(${state.fillStyle.angle} .5 .5)`}>
                  {state.animate && state.fillStyle.fillType === "Linear" && <animateTransform attributeName="gradientTransform" type="rotate" values="0 .5 .5;360 .5 .5" dur="5s" repeatCount="indefinite" />}
                  <stop offset="0" stopColor={state.fillStyle.primaryColor}>
                    {state.animate && state.fillStyle.fillType === "Linear" && <animate attributeName="stop-color" values={`${state.fillStyle.primaryColor};${state.fillStyle.secondaryColor};${state.fillStyle.primaryColor}`} dur="3s" repeatCount="indefinite" />}
                  </stop>
                  <stop offset="1" stopColor={state.fillStyle.secondaryColor}>
                    {state.animate && state.fillStyle.fillType === "Linear" && <animate attributeName="stop-color" values={`${state.fillStyle.secondaryColor};${state.fillStyle.primaryColor};${state.fillStyle.secondaryColor}`} dur="3s" repeatCount="indefinite" />}
                  </stop>
                </linearGradient>
                <radialGradient id="studio-glare" cx="100%" cy="0%" r="125%">
                  <stop offset="0" stopColor="#FFFFFF" stopOpacity=".95" />
                  <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
                </radialGradient>
                <filter id="studio-noise" x="-20%" y="-20%" width="140%" height="140%">
                  <feTurbulence type="fractalNoise" baseFrequency="0.72" numOctaves="4" seed="4" />
                  <feColorMatrix type="saturate" values="0" />
                </filter>
                {state.type === "svg" && state.fillStyle.clip && ActiveIcon && (
                  <mask id="studio-clip-hole">
                    <rect width={state.totalSize} height={state.totalSize} fill="white" />
                    <ActiveIcon x={(state.totalSize - state.icon.size) / 2} y={(state.totalSize - state.icon.size) / 2} width={state.icon.size} height={state.icon.size} color="black" strokeWidth={2} />
                  </mask>
                )}
              </defs>

              <rect
                x={state.background.strokeSize / 2}
                y={state.background.strokeSize / 2}
                width={state.totalSize - state.background.strokeSize}
                height={state.totalSize - state.background.strokeSize}
                rx={state.background.radius}
                fill={state.fillStyle.fillType === "Linear" ? "url(#studio-gradient)" : state.fillStyle.primaryColor}
                stroke={state.background.strokeColor}
                strokeOpacity={state.background.strokeOpacity / 100}
                strokeWidth={state.background.strokeSize}
                mask={state.type === "svg" && state.fillStyle.clip ? "url(#studio-clip-hole)" : undefined}
              />

              {state.background.radialGlare && (
                <rect x={state.background.strokeSize / 2} y={state.background.strokeSize / 2} width={state.totalSize - state.background.strokeSize} height={state.totalSize - state.background.strokeSize} rx={state.background.radius} fill="url(#studio-glare)" opacity=".72" style={{ mixBlendMode: "overlay" }} />
              )}

              {state.background.noiseTexture && (
                <rect x={state.background.strokeSize / 2} y={state.background.strokeSize / 2} width={state.totalSize - state.background.strokeSize} height={state.totalSize - state.background.strokeSize} rx={state.background.radius} fill="#FFFFFF" filter="url(#studio-noise)" opacity={state.background.noiseOpacity / 180} style={{ mixBlendMode: "overlay" }} />
              )}

              {state.type === "svg" && ActiveIcon && (
                <ActiveIcon x={(state.totalSize - state.icon.size) / 2} y={(state.totalSize - state.icon.size) / 2} width={state.icon.size} height={state.icon.size} color={state.icon.color} strokeWidth={2} />
              )}

              {state.type === "text" && (
                <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fill={state.icon.color} fontSize={state.icon.size} fontFamily={state.icon.family} fontWeight="600">{state.value}</text>
              )}

              {state.type === "local" && localSvgData && (
                <image href={localSvgData} x={(state.totalSize - state.icon.size) / 2} y={(state.totalSize - state.icon.size) / 2} width={state.icon.size} height={state.icon.size} preserveAspectRatio="xMidYMid meet" />
              )}
            </svg>
            <span className="size-pill">{state.totalSize}x{state.totalSize}</span>
          </div>
        </section>

        <aside className="floating-panel right-panel">{rightPanel}</aside>

        <div className="mobile-tools">
          <button onClick={() => setMobilePanel("left")}><LayoutDashboard size={22} /></button>
          <button onClick={() => setMobilePanel("right")}><Palette size={22} /></button>
        </div>
      </section>

      {mobilePanel && (
        <div className="mobile-sheet-backdrop" onClick={() => setMobilePanel(null)}>
          <div className="mobile-sheet" onClick={(e) => e.stopPropagation()}>
            <button className="sheet-close" onClick={() => setMobilePanel(null)}><X size={18} /></button>
            {mobilePanel === "left" ? leftPanel : rightPanel}
          </div>
        </div>
      )}

      {exportModal && (
        <div className="modal-backdrop" onClick={() => setExportModal(false)}>
          <div className="export-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header"><strong>Exports</strong><button onClick={() => setExportModal(false)}><X size={17} /></button></div>
            <ExportChoice filename={`${state.filename}.svg`} size={state.totalSize} checked={exportSvg} onChange={setExportSvg} />
            <ExportChoice filename={`${state.filename}.png`} size={state.totalSize} checked={exportPng} onChange={setExportPng} />

            {state.type !== "local" && (
              <CodeField label="Share Link" value={shareUrl} onCopy={() => void copyText(shareUrl, "Copied share link")} />
            )}
            {state.type !== "local" && (
              <CodeField label="API" value={apiUrl} onCopy={() => void copyText(apiUrl, "Copied API URL")} />
            )}
            <CodeField label="SVG Code" value={svgCode} onCopy={() => void copySvg()} />

            <button className="modal-export" disabled={!exportSvg && !exportPng} onClick={() => void exportSelected()}>export icon</button>
          </div>
        </div>
      )}

      {notice && <div className="toast">{notice}</div>}
    </main>
  );
}

function AccordionSection({ title, children, defaultOpen = false }: { title: string; children: ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="accordion-section">
      <button className="accordion-trigger" onClick={() => setOpen((v) => !v)}>
        <span>{title}</span><ChevronDown size={18} className={open ? "open" : ""} />
      </button>
      {open && <div className="accordion-content">{children}</div>}
    </section>
  );
}

function ToggleRow({ label, checked, onChange, disabled = false }: { label: ReactNode; checked: boolean; onChange: (value: boolean) => void; disabled?: boolean }) {
  return (
    <div className={`control-row ${disabled ? "disabled" : ""}`}>
      <span>{label}</span>
      <button className={`switch ${checked ? "checked" : ""}`} disabled={disabled} onClick={() => onChange(!checked)} aria-pressed={checked}><span /></button>
    </div>
  );
}

function ColorRow({ label, value, onChange, disabled = false }: { label: string; value: string; onChange: (value: string) => void; disabled?: boolean }) {
  return (
    <div className={`control-row ${disabled ? "disabled" : ""}`}>
      <span>{label}</span>
      <label className="color-control">
        <input type="color" value={value} disabled={disabled} onChange={(e) => onChange(e.target.value.toUpperCase())} />
        <input className="hex-input" value={value.toUpperCase()} disabled={disabled} maxLength={7} onChange={(e) => { const next = e.target.value.toUpperCase(); if (/^#[0-9A-F]{0,6}$/.test(next)) onChange(next); }} onBlur={(e) => { if (!/^#[0-9A-F]{6}$/.test(e.target.value)) onChange("#FFFFFF"); }} />
      </label>
    </div>
  );
}

function NumberRow({ label, value, unit, min, max, onChange, disabled = false }: { label: string; value: number; unit: string; min: number; max: number; onChange: (value: number) => void; disabled?: boolean }) {
  return (
    <label className={`control-row ${disabled ? "disabled" : ""}`}>
      <span>{label}</span>
      <span className="number-control">
        <input type="number" value={Math.round(value)} min={min} max={max} disabled={disabled} onChange={(e) => onChange(clamp(Number(e.target.value), min, max))} />
        <i>{unit}</i>
      </span>
    </label>
  );
}

function SelectRow({ label, value, options, onChange }: { label: string; value: string; options: readonly string[]; onChange: (value: string) => void }) {
  return (
    <label className="control-row">
      <span>{label}</span>
      <span className="select-control"><select value={value} onChange={(e) => onChange(e.target.value)}>{options.map((option) => <option key={option} value={option}>{option}</option>)}</select><ChevronDown size={17} /></span>
    </label>
  );
}

function SliderRow({ label, value, onChange, disabled = false }: { label: string; value: number; onChange: (value: number) => void; disabled?: boolean }) {
  return (
    <div className={`slider-row ${disabled ? "disabled" : ""}`}>
      <span>{label}</span>
      <div><output>{Math.round(value)}%</output><input type="range" min={0} max={100} value={value} disabled={disabled} onChange={(e) => onChange(Number(e.target.value))} /></div>
    </div>
  );
}

function ExportChoice({ filename, size, checked, onChange }: { filename: string; size: number; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <label className="export-choice"><span>{filename}</span><small>{size}x{size}</small><input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} /></label>
  );
}

function CodeField({ label, value, onCopy }: { label: string; value: string; onCopy: () => void }) {
  return (
    <div className="code-field"><div><strong>{label}</strong><button onClick={onCopy}><Copy size={15} /></button></div><textarea readOnly value={value} /></div>
  );
}

function safeHex(value: string | null, fallback: string) {
  return value && /^#[0-9A-Fa-f]{6}$/.test(value) ? value.toUpperCase() : fallback;
}

function clamp(value: number, min: number, max: number) {
  const safe = Number.isFinite(value) ? value : min;
  return Math.min(Math.max(safe, min), max);
}
