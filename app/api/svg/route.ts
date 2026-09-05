import Icon from "lucide-static";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams;
  const type = sp.get("type") === "text" ? "text" : "svg";
  const value = sp.get("value") || "Sparkles";
  const totalSize = clamp(Number(sp.get("totalSize") || 256), 64, 1024);
  const iconSize = clamp(Number(sp.get("size") || 128), 12, totalSize);
  const radius = clamp(Number(sp.get("radius") || 64), 0, totalSize / 2);
  const strokeSize = clamp(Number(sp.get("strokeSize") || 0), 0, 64);
  const angle = Number(sp.get("angle") || 45);
  const primary = safeColor(sp.get("primaryColor") || "#FC466B");
  const secondary = safeColor(sp.get("secondaryColor") || "#3F5EFB");
  const color = safeColor(sp.get("color") || "#FFFFFF");

  let foreground = "";
  if (type === "svg") {
    const raw = (Icon as Record<string, string>)[value];
    if (!raw) return new Response("Unknown Lucide icon", { status: 404 });
    const inner = raw.match(/<svg[^>]*>([\s\S]*?)<\/svg>/i)?.[1];
    if (!inner) return new Response("Invalid Lucide icon", { status: 500 });
    foreground = `<svg x="${(totalSize - iconSize) / 2}" y="${(totalSize - iconSize) / 2}" width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`;
  } else {
    foreground = `<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="${color}" font-size="${Math.round(iconSize * 0.62)}" font-family="Inter,system-ui,sans-serif" font-weight="700">${escapeXml(value)}</text>`;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${totalSize}" height="${totalSize}" viewBox="0 0 ${totalSize} ${totalSize}">
  <defs>
    <linearGradient id="g" gradientTransform="rotate(${angle} .5 .5)">
      <stop offset="0" stop-color="${primary}"/><stop offset="1" stop-color="${secondary}"/>
    </linearGradient>
  </defs>
  <rect x="${strokeSize / 2}" y="${strokeSize / 2}" width="${totalSize - strokeSize}" height="${totalSize - strokeSize}" rx="${radius}" fill="url(#g)" stroke="#fff" stroke-opacity=".8" stroke-width="${strokeSize}"/>
  ${foreground}
</svg>`;

  return new Response(svg, {
    headers: {
      "content-type": "image/svg+xml; charset=utf-8",
      "cache-control": "public, max-age=0, s-maxage=86400",
    },
  });
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(Number.isFinite(value) ? value : min, min), max);
}
function safeColor(value: string) {
  return /^#[0-9a-fA-F]{6}$/.test(value) ? value : "#FFFFFF";
}
function escapeXml(value: string) {
  return value.replace(/[<>&'\"]/g, (char) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" }[char] || char));
}
