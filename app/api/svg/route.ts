import * as StaticIcons from "lucide-static";

export const runtime = "nodejs";

const allowedFonts = new Set([
  "sans-serif",
  "serif",
  "monospace",
  "cursive",
  "fantasy",
  "system-ui",
  "math",
  "fangsong",
]);

export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams;
  const type = sp.get("type") === "text" ? "text" : "svg";
  const value = sp.get("value") || "Sparkles";
  const totalSize = clamp(Number(sp.get("totalSize") || 256), 64, 1024);
  const iconSize = clamp(Number(sp.get("size") || 128), 8, totalSize);
  const radius = clamp(Number(sp.get("radius") || 64), 0, totalSize / 2);
  const strokeSize = clamp(Number(sp.get("strokeSize") || 0), 0, Math.min(64, totalSize));
  const strokeOpacity = clamp(Number(sp.get("strokeOpacity") || 100), 0, 100) / 100;
  const noiseOpacity = clamp(Number(sp.get("noiseOpacity") || 50), 0, 100) / 180;
  const angle = clamp(Number(sp.get("angle") || 45), 0, 360);
  const primary = safeColor(sp.get("primaryColor") || "#FC466B");
  const secondary = safeColor(sp.get("secondaryColor") || "#3F5EFB");
  const color = safeColor(sp.get("color") || "#FFFFFF");
  const strokeColor = safeColor(sp.get("strokeColor") || "#FFFFFF");
  const fillType = sp.get("fillType") === "Solid" ? "Solid" : "Linear";
  const animate = sp.get("animate") === "true" && fillType === "Linear";
  const clip = sp.get("clip") === "true" && type === "svg";
  const radialGlare = sp.get("radialGlare") === "true";
  const noiseTexture = sp.get("noiseTexture") === "true";
  const requestedFamily = sp.get("family") || "sans-serif";
  const family = allowedFonts.has(requestedFamily) ? requestedFamily : "sans-serif";
  const innerSize = Math.max(0, totalSize - strokeSize);

  let iconInner = "";
  let foreground = "";
  if (type === "svg") {
    const raw = StaticIcons[value as keyof typeof StaticIcons] as string | undefined;
    if (!raw) return new Response("Unknown Lucide icon", { status: 404 });
    iconInner = raw.match(/<svg[^>]*>([\s\S]*?)<\/svg>/i)?.[1] || "";
    if (!iconInner) return new Response("Invalid Lucide icon", { status: 500 });
    foreground = iconSvg(iconInner, totalSize, iconSize, color);
  } else {
    foreground = `<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="${color}" font-size="${iconSize}" font-family="${family}" font-weight="600">${escapeXml(value)}</text>`;
  }

  const gradient = fillType === "Linear"
    ? `
    <linearGradient id="studio-gradient" gradientTransform="rotate(${angle} .5 .5)">
      ${animate ? '<animateTransform attributeName="gradientTransform" type="rotate" values="0 .5 .5;360 .5 .5" dur="5s" repeatCount="indefinite"/>' : ""}
      <stop offset="0" stop-color="${primary}">${animate ? `<animate attributeName="stop-color" values="${primary};${secondary};${primary}" dur="3s" repeatCount="indefinite"/>` : ""}</stop>
      <stop offset="1" stop-color="${secondary}">${animate ? `<animate attributeName="stop-color" values="${secondary};${primary};${secondary}" dur="3s" repeatCount="indefinite"/>` : ""}</stop>
    </linearGradient>`
    : "";

  const clipMask = clip
    ? `
    <mask id="studio-clip-hole">
      <rect width="${totalSize}" height="${totalSize}" fill="white"/>
      ${iconSvg(iconInner, totalSize, iconSize, "#000000")}
    </mask>`
    : "";

  const defs = `<defs>
    ${gradient}
    <radialGradient id="studio-glare" cx="100%" cy="0%" r="125%">
      <stop offset="0" stop-color="#FFFFFF" stop-opacity=".95"/>
      <stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/>
    </radialGradient>
    <filter id="studio-noise" x="-20%" y="-20%" width="140%" height="140%">
      <feTurbulence type="fractalNoise" baseFrequency="0.72" numOctaves="4" seed="4"/>
      <feColorMatrix type="saturate" values="0"/>
    </filter>
    ${clipMask}
  </defs>`;

  const fill = fillType === "Linear" ? "url(#studio-gradient)" : primary;
  const mask = clip ? ' mask="url(#studio-clip-hole)"' : "";
  const glare = radialGlare
    ? `<rect x="${strokeSize / 2}" y="${strokeSize / 2}" width="${innerSize}" height="${innerSize}" rx="${radius}" fill="url(#studio-glare)" opacity=".72" style="mix-blend-mode:overlay"/>`
    : "";
  const noise = noiseTexture
    ? `<rect x="${strokeSize / 2}" y="${strokeSize / 2}" width="${innerSize}" height="${innerSize}" rx="${radius}" fill="#FFFFFF" filter="url(#studio-noise)" opacity="${noiseOpacity.toFixed(3)}" style="mix-blend-mode:overlay"/>`
    : "";

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${totalSize}" height="${totalSize}" viewBox="0 0 ${totalSize} ${totalSize}">
  ${defs}
  <rect x="${strokeSize / 2}" y="${strokeSize / 2}" width="${innerSize}" height="${innerSize}" rx="${radius}" fill="${fill}" stroke="${strokeColor}" stroke-opacity="${strokeOpacity}" stroke-width="${strokeSize}"${mask}/>
  ${glare}
  ${noise}
  ${foreground}
</svg>`;

  return new Response(svg, {
    headers: {
      "content-type": "image/svg+xml; charset=utf-8",
      "cache-control": "public, max-age=0, s-maxage=86400",
    },
  });
}

function iconSvg(inner: string, totalSize: number, iconSize: number, color: string) {
  return `<svg x="${(totalSize - iconSize) / 2}" y="${(totalSize - iconSize) / 2}" width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(Number.isFinite(value) ? value : min, min), max);
}

function safeColor(value: string) {
  return /^#[0-9a-fA-F]{6}$/.test(value) ? value.toUpperCase() : "#FFFFFF";
}

function escapeXml(value: string) {
  return value.replace(/[<>&'\"]/g, (char) => ({
    "<": "&lt;",
    ">": "&gt;",
    "&": "&amp;",
    "'": "&apos;",
    '"': "&quot;",
  }[char] || char));
}
