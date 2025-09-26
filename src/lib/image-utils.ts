// Lightweight canvas-based image generator for mock announcements
// Returns a data URL (PNG). Safe no-op on SSR.
export function generateAnnouncementImage(
  title: string,
  subtitle: string = "",
  seed: string | number = "0"
): string {
  if (typeof document === "undefined") return "";
  const width = 800;
  const height = 420;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const canvas = document.createElement("canvas");
  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";
  ctx.scale(dpr, dpr);

  // Seeded colors
  const s = typeof seed === "number" ? seed : Array.from(String(seed)).reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const hue = (s * 37) % 360;
  const hue2 = (hue + 25) % 360;

  // Gradient background
  const grad = ctx.createLinearGradient(0, 0, width, height);
  grad.addColorStop(0, `hsl(${hue} 85% 52%)`);
  grad.addColorStop(1, `hsl(${hue2} 75% 42%)`);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // Glass panel
  const panelX = 20, panelY = 20, panelW = width - 40, panelH = height - 40;
  ctx.fillStyle = "rgba(255,255,255,0.12)";
  roundRect(ctx, panelX, panelY, panelW, panelH, 16);
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.35)";
  ctx.lineWidth = 1;
  roundRect(ctx, panelX, panelY, panelW, panelH, 16);
  ctx.stroke();

  // Icon circle
  const circleX = 64, circleY = 64, radius = 28;
  ctx.beginPath();
  ctx.arc(circleX, circleY, radius, 0, Math.PI * 2);
  ctx.closePath();
  ctx.fillStyle = "rgba(0,0,0,0.2)";
  ctx.fill();
  // Simple megaphone glyph
  ctx.save();
  ctx.translate(circleX - 14, circleY - 10);
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 8, 22, 8);
  ctx.beginPath();
  ctx.moveTo(22, 6);
  ctx.lineTo(34, 12);
  ctx.lineTo(22, 18);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Text styles
  ctx.fillStyle = "#fff";
  ctx.shadowColor = "rgba(0,0,0,0.35)";
  ctx.shadowBlur = 8;
  ctx.shadowOffsetY = 2;

  // Title
  const titleMaxWidth = panelW - 56;
  ctx.font = "bold 28px Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial";
  const titleLines = wrapText(ctx, title || "Announcement", titleMaxWidth);
  drawLines(ctx, titleLines, 112, 80, 34);

  // Subtitle
  ctx.font = "500 18px Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial";
  const subLines = wrapText(ctx, subtitle || "", titleMaxWidth);
  drawLines(ctx, subLines, 112, 80 + titleLines.length * 34 + 8, 26);

  // Footer band
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
  ctx.fillStyle = "rgba(0,0,0,0.20)";
  roundRect(ctx, panelX, height - 66, panelW, 46, 12);
  ctx.fill();

  ctx.fillStyle = "#fff";
  ctx.font = "600 16px Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial";
  ctx.fillText("easysearch.sl", 36, height - 36);

  try {
    return canvas.toDataURL("image/png");
  } catch {
    return "";
  }
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  if (!text) return [];
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const test = line ? line + " " + w : w;
    const width = ctx.measureText(test).width;
    if (width > maxWidth && line) {
      lines.push(line);
      line = w;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines.slice(0, 4); // limit lines to avoid overflow
}

function drawLines(ctx: CanvasRenderingContext2D, lines: string[], x: number, y: number, lineHeight: number) {
  let yy = y;
  for (const ln of lines) {
    ctx.fillText(ln, x, yy);
    yy += lineHeight;
  }
}
