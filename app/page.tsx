"use client";

import {
  Download,
  RotateCcw,
  Search,
  Sparkles,
  Copy,
  ImageDown,
  Code2,
  Type,
  Smile,
  Shapes,
} from "lucide-react";
import { icons, type LucideIcon } from "lucide-react";
import { useMemo, useRef, useState } from "react";

const gradientPresets = [
  ["#8E2DE2", "#4A00E0"],
  ["#00B4DB", "#0083B0"],
  ["#FC466B", "#3F5EFB"],
  ["#F12711", "#F5AF19"],
  ["#7F7FD5", "#86A8E7"],
  ["#654EA3", "#EAafC8"],
  ["#11998E", "#38EF7D"],
  ["#ee0979", "#ff6a00"],
];

type Mode = "icon" | "text" | "emoji";

type StudioState = {
  name: string;
  mode: Mode;
  value: string;
  size: number;
  canvas: number;
  radius: number;
  stroke: number;
  iconColor: string;
  primary: string;
  secondary: string;
  angle: number;
  glare: boolean;
};

const initialState: StudioState = {
  name: "export-icon",
  mode: "icon",
  value: "Sparkles",
  size: 124,
  canvas: 256,
  radius: 64,
  stroke: 0,
  iconColor: "#ffffff",
  primary: "#FC466B",
  secondary: "#3F5EFB",
  angle: 45,
  glare: false,
};

export default function Page() {
  const [state, setState] = useState(initialState);
  const [query, setQuery] = useState("");
  const svgRef = useRef<SVGSVGElement | null>(null);

  const iconNames = useMemo(() => {
    const all = Object.keys(icons).filter((name) => /^[A-Z]/.test(name));
    const q = query.trim().toLowerCase();
    return (q ? all.filter((name) => name.toLowerCase().includes(q)) : all).slice(0, 120);
  }, [query]);

  const ActiveIcon = state.mode === "icon" ? (icons[state.value as keyof typeof icons] as LucideIcon | undefined) : undefined;

  const reset = () => setState(initialState);

  const serialize = () => {
    if (!svgRef.current) return "";
    return new XMLSerializer().serializeToString(svgRef.current);
  };

  const copySvg = async () => {
    const svg = serialize();
    if (svg) await navigator.clipboard.writeText(svg);
  };

  const downloadSvg = () => {
    const svg = serialize();
    if (!svg) return;
    const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `${state.name || "icon"}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadPng = () => {
    const svg = serialize();
    if (!svg) return;
    const image = new Image();
    const src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = state.canvas;
      canvas.height = state.canvas;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(image, 0, 0, state.canvas, state.canvas);
      const a = document.createElement("a");
      a.href = canvas.toDataURL("image/png");
      a.download = `${state.name || "icon"}.png`;
      a.click();
    };
    image.src = src;
  };

  const apiUrl = () => {
    const params = new URLSearchParams({
      filename: state.name,
      type: state.mode === "icon" ? "svg" : "text",
      value: state.value,
      totalSize: String(state.canvas),
      primaryColor: state.primary,
      secondaryColor: state.secondary,
      angle: String(state.angle),
      radius: String(state.radius),
      strokeSize: String(state.stroke),
      color: state.iconColor,
      size: String(state.size),
    });
    return `/api/svg?${params.toString()}`;
  };

  return (
    <main className="studio-shell">
      <header className="topbar">
        <div className="brand"><Sparkles size={19} /><span>Icon Studio</span></div>
        <input
          className="filename"
          value={state.name}
          onChange={(e) => setState({ ...state, name: e.target.value })}
          aria-label="Filename"
        />
        <div className="top-actions">
          <button className="ghost" onClick={reset}><RotateCcw size={15}/> Reset</button>
          <button className="ghost" onClick={() => navigator.clipboard.writeText(location.origin + apiUrl())}><Code2 size={15}/> API</button>
          <button className="primary" onClick={downloadSvg}><Download size={15}/> Export</button>
        </div>
      </header>

      <section className="workspace">
        <aside className="panel left-panel">
          <div className="mode-tabs">
            <button className={state.mode === "icon" ? "active" : ""} onClick={() => setState({ ...state, mode: "icon", value: "Sparkles" })}><Shapes size={15}/> Icons</button>
            <button className={state.mode === "text" ? "active" : ""} onClick={() => setState({ ...state, mode: "text", value: "A" })}><Type size={15}/> Text</button>
            <button className={state.mode === "emoji" ? "active" : ""} onClick={() => setState({ ...state, mode: "emoji", value: "✨" })}><Smile size={15}/> Emoji</button>
          </div>

          {state.mode === "icon" ? (
            <>
              <label className="searchbox"><Search size={15}/><input placeholder="Search Lucide icons…" value={query} onChange={(e) => setQuery(e.target.value)} /></label>
              <div className="icon-grid">
                {iconNames.map((name) => {
                  const Item = icons[name as keyof typeof icons] as LucideIcon;
                  return <button key={name} title={name} className={state.value === name ? "selected" : ""} onClick={() => setState({ ...state, value: name })}><Item size={18}/></button>;
                })}
              </div>
            </>
          ) : (
            <div className="input-card">
              <label>{state.mode === "emoji" ? "Emoji" : "Text"}</label>
              <input value={state.value} maxLength={state.mode === "emoji" ? 8 : 20} onChange={(e) => setState({ ...state, value: e.target.value })}/>
            </div>
          )}
        </aside>

        <section className="preview-stage">
          <div className="preview-note">Live preview</div>
          <svg ref={svgRef} width={state.canvas} height={state.canvas} viewBox={`0 0 ${state.canvas} ${state.canvas}`} xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="studio-gradient" gradientTransform={`rotate(${state.angle} .5 .5)`}>
                <stop offset="0" stopColor={state.primary}/><stop offset="1" stopColor={state.secondary}/>
              </linearGradient>
              <radialGradient id="studio-glare"><stop offset="0" stopColor="#fff" stopOpacity=".72"/><stop offset="1" stopColor="#fff" stopOpacity="0"/></radialGradient>
            </defs>
            <rect x={state.stroke/2} y={state.stroke/2} width={state.canvas-state.stroke} height={state.canvas-state.stroke} rx={state.radius} fill="url(#studio-gradient)" stroke="#ffffff" strokeOpacity=".8" strokeWidth={state.stroke}/>
            {state.glare && <rect width={state.canvas} height={state.canvas} rx={state.radius} fill="url(#studio-glare)" opacity=".55"/>}
            {state.mode === "icon" && ActiveIcon ? (
              <ActiveIcon x={(state.canvas-state.size)/2} y={(state.canvas-state.size)/2} width={state.size} height={state.size} color={state.iconColor} strokeWidth={2}/>
            ) : (
              <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fill={state.iconColor} fontSize={state.size * (state.mode === "emoji" ? .72 : .62)} fontFamily={state.mode === "emoji" ? "Apple Color Emoji, Segoe UI Emoji, sans-serif" : "Inter, system-ui, sans-serif"} fontWeight="700">{state.value}</text>
            )}
          </svg>
          <div className="size-pill">{state.canvas} × {state.canvas}</div>
        </section>

        <aside className="panel right-panel">
          <ControlGroup title="Fill">
            <ColorRow label="Primary" value={state.primary} onChange={(v) => setState({ ...state, primary: v })}/>
            <ColorRow label="Secondary" value={state.secondary} onChange={(v) => setState({ ...state, secondary: v })}/>
            <RangeRow label="Angle" value={state.angle} min={0} max={360} unit="°" onChange={(v) => setState({ ...state, angle: v })}/>
            <div className="preset-grid">{gradientPresets.map(([a,b]) => <button key={a+b} onClick={() => setState({ ...state, primary: a, secondary: b })} style={{ background: `linear-gradient(135deg, ${a}, ${b})` }}/>)}</div>
          </ControlGroup>
          <ControlGroup title="Icon">
            <ColorRow label="Color" value={state.iconColor} onChange={(v) => setState({ ...state, iconColor: v })}/>
            <RangeRow label="Icon size" value={state.size} min={24} max={220} unit="px" onChange={(v) => setState({ ...state, size: v })}/>
            <RangeRow label="Canvas" value={state.canvas} min={128} max={512} step={16} unit="px" onChange={(v) => setState({ ...state, canvas: v })}/>
          </ControlGroup>
          <ControlGroup title="Background">
            <RangeRow label="Radius" value={state.radius} min={0} max={state.canvas/2} unit="px" onChange={(v) => setState({ ...state, radius: v })}/>
            <RangeRow label="Border" value={state.stroke} min={0} max={24} unit="px" onChange={(v) => setState({ ...state, stroke: v })}/>
            <label className="toggle-row"><span>Radial glare</span><input type="checkbox" checked={state.glare} onChange={(e) => setState({ ...state, glare: e.target.checked })}/></label>
          </ControlGroup>
          <ControlGroup title="Export">
            <div className="export-grid">
              <button onClick={downloadSvg}><Download size={16}/> SVG</button>
              <button onClick={downloadPng}><ImageDown size={16}/> PNG</button>
              <button onClick={copySvg}><Copy size={16}/> Copy SVG</button>
              <button onClick={() => navigator.clipboard.writeText(location.origin + apiUrl())}><Code2 size={16}/> Copy API</button>
            </div>
          </ControlGroup>
        </aside>
      </section>
    </main>
  );
}

function ControlGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="control-group"><h2>{title}</h2>{children}</section>;
}

function ColorRow({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label className="control-row"><span>{label}</span><div className="color-control"><input type="color" value={value} onChange={(e) => onChange(e.target.value)}/><code>{value.toUpperCase()}</code></div></label>;
}

function RangeRow({ label, value, onChange, min, max, step = 1, unit }: { label: string; value: number; onChange: (value: number) => void; min: number; max: number; step?: number; unit: string }) {
  return <label className="range-row"><div><span>{label}</span><output>{Math.round(value)}{unit}</output></div><input type="range" value={value} min={min} max={max} step={step} onChange={(e) => onChange(Number(e.target.value))}/></label>;
}
