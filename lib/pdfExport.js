import { getPranayamaRecommendations } from "./pranayamaRules.js";
import { getPoseImage } from "./poseImages";

export async function exportSequencePDF(client, sequence, asanaCount = 6) {
  let seqData = {};
  try {
    seqData = typeof sequence.poses === "string" ? JSON.parse(sequence.poses) : sequence.poses;
  } catch { seqData = {}; }

  const warmupPhase    = seqData.phases?.find(p => p.phase === "Warm-up");
  const asanasPhase    = seqData.phases?.find(p => p.phase === "Asanas");

  const startDate = new Date(sequence.createdAt || Date.now());
  const endDate   = new Date(startDate);
  endDate.setDate(endDate.getDate() + 9);

  function fmt(d) {
    return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase();
  }
  function fmtShort(d) {
    return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
  }

  function progressionCounts(level) {
    if (level === "advanced")     return "(10-12-15 times)";
    if (level === "intermediate") return "(8-10-12 times)";
    return "(6-8-10 times)";
  }
  const progression = progressionCounts(client?.experience);

  const dayStrip = Array.from({ length: 10 }, (_, i) => {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    return `<div style="text-align:center;padding:2px 0;font-size:8.5px;color:#0F6E56;">
      <div style="font-weight:700;font-size:9px;">Day ${i + 1}</div>
      <div style="color:#6b7280;">${fmtShort(d)}</div>
    </div>`;
  }).join("");

  const poses = (asanasPhase?.poses || []).slice(0, asanaCount);
  const cols = poses.length <= 4 ? poses.length : poses.length <= 8 ? Math.ceil(poses.length / 2) : 4;

  function formatCue(cue) {
    if (!cue) return "";
    const cueText = Array.isArray(cue) ? cue.join(" ") : cue;
    const short = cueText.length > 300 ? cueText.slice(0, 297) + "..." : cueText;
    return `${short} <span style="color:#1D9E75;font-weight:600;">${progression}</span>`;
  }

  const asanaCards = poses.map((pose, i) => {
    const cleanName = (pose.sanskrit || pose.name).replace(/\s*\(.*?\)/g, '').replace(/\s*(modified|variation|with\s+.*)/gi, '').trim();
    const imgSrc = getPoseImage(cleanName, "Asanas");
    const imgHtml = imgSrc
      ? `<img src="${imgSrc}" alt="${pose.name}" style="width:100%;height:95px;object-fit:contain;display:block;background:#f9fafb;" onerror="this.style.display='none'" />`
      : `<div style="width:100%;height:95px;background:#f3f4f6;display:flex;align-items:center;justify-content:center;font-size:11px;color:#9ca3af;">No image</div>`;
    return `<div style="background:white;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;text-align:center;">
        <div style="position:relative;">
          ${imgHtml}
          <div style="position:absolute;top:5px;left:5px;background:#1D9E75;color:white;width:20px;height:20px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;">${i + 1}</div>
        </div>
        <div style="padding:5px 6px;text-align:left;">
          <div style="font-size:10.5px;font-weight:700;color:#C0392B;text-align:center;">${pose.sanskrit || pose.name}</div>
          <div style="font-size:9px;color:#6b7280;font-style:italic;text-align:center;margin-bottom:3px;">${pose.name}</div>
          <div style="font-size:8.5px;color:#374151;line-height:1.4;">${formatCue(pose.cues)}</div>
        </div>
      </div>`;
  }).join("");

  const warmupPoses = warmupPhase?.poses || [];
  const half = Math.ceil(warmupPoses.length / 2);
  const col1 = warmupPoses.slice(0, half);
  const col2 = warmupPoses.slice(half);
  const warmupCol = (arr, offset = 0) => arr.map((p, i) =>
    `<div style="font-size:9px;color:#92400E;padding:1.5px 0;">${i + 1 + offset}. <b>${p.sanskrit || p.name}</b> <i style="color:#B45309;">(${p.name})</i></div>`
  ).join("");
  const clientConditions = Array.isArray(client?.conditions)
    ? client.conditions
    : (client?.conditions || "").split(",").filter(Boolean);
  const clientInjuries = Array.isArray(client?.injuries)
    ? client.injuries
    : (client?.injuries || "").split(",").filter(Boolean);
  const { recommended: recPrana, notRecommended: notRecPrana } = getPranayamaRecommendations(clientConditions, clientInjuries);

  const recList = recPrana.map((p, i) =>
    `<span style="font-size:9px;color:#0F6E56;margin-right:12px;">${i+1}. <b>${p.sanskrit}</b> <i>(${p.name})</i></span>`
  ).join("") || '<span style="font-size:9px;color:#6b7280;">As advised by instructor</span>';

  const notRecSection = notRecPrana.length > 0 ? `
    <div style="margin-top:3px;">
      <span style="font-size:9px;font-weight:700;color:#DC2626;">Not Recommended: </span>
      ${notRecPrana.map(p => `<span style="font-size:9px;color:#DC2626;margin-right:8px;">❌ ${p.sanskrit}</span>`).join("")}
    </div>` : "";

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>Asana Plan — ${client?.name || ""}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Georgia, "Times New Roman", serif; background: white; color: #1a1a1a; }
    @media print {
      .no-print { display: none !important; }
      @page { margin: 4mm; size: A4 landscape; }
      * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body>

  <div class="no-print" style="position:fixed;top:12px;right:12px;z-index:999;display:flex;gap:8px;">
    <button onclick="window.print()" style="background:#1D9E75;color:white;border:none;padding:8px 18px;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;">Print / Save PDF</button>
    <button onclick="window.close()" style="background:#6b7280;color:white;border:none;padding:8px 18px;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;">Close</button>
  </div>

  <div style="padding:4mm 5mm;">

    <div style="display:grid;grid-template-columns:1fr auto 1fr;align-items:center;margin-bottom:4px;padding-bottom:4px;border-bottom:2px solid #1D9E75;">
      <div style="font-size:9px;color:#6b7280;">${sequence.style} · ${sequence.goal} · ${sequence.duration} min</div>
      <div style="text-align:center;">
        <div style="font-size:18px;font-weight:800;color:#1D9E75;letter-spacing:0.08em;font-family:Georgia,serif;">IRA YOGA STUDIO</div>
        <div style="font-size:11px;color:#0F6E56;font-weight:600;margin-top:1px;">
          Asana Plan For <strong>${client?.name || ""}</strong> &middot; ${fmt(startDate)} &mdash; ${fmt(endDate)}
        </div>
      </div>
      <div style="text-align:right;font-size:9px;color:#6b7280;">Cycle ${sequence.cycleNumber || 1} &middot; ${client?.experience || ""}</div>
    </div>

    <div style="display:grid;grid-template-columns:repeat(10,1fr);gap:3px;margin-bottom:5px;background:#E1F5EE;border-radius:6px;padding:3px 4px;">
      ${dayStrip}
    </div>

    <div style="display:grid;grid-template-columns:145px 1fr;gap:8px;margin-bottom:5px;align-items:start;">
      <div>
        <div style="font-size:10px;font-weight:700;color:#92400E;margin-bottom:4px;padding-bottom:3px;border-bottom:1.5px solid #F59E0B;">Warm Up <span style="font-size:8px;font-weight:400;">(15 min)</span></div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:0 4px;">
          <div>${warmupCol(col1, 0)}</div>
          <div>${warmupCol(col2, half)}</div>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:repeat(${cols},1fr);gap:6px;">
        ${asanaCards}
      </div>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;border-top:1.5px solid #1D9E75;padding-top:4px;">
      <div>
        <div style="font-size:9.5px;font-weight:700;color:#0F6E56;margin-bottom:3px;">Recommended Pranayamas</div>
        ${recPrana.map((p, i) => `<div style="font-size:9px;color:#0F6E56;padding:1px 0;">${i+1}. <b>${p.sanskrit}</b> <i>(${p.name})</i></div>`).join("") || `<div style="font-size:9px;color:#6b7280;">As advised by instructor</div>`}
      </div>
      ${notRecPrana.length > 0 ? `<div>
        <div style="font-size:9.5px;font-weight:700;color:#DC2626;margin-bottom:3px;">Not Recommended</div>
        ${notRecPrana.map(p => `<div style="font-size:9px;color:#DC2626;padding:1px 0;">❌ <b>${p.sanskrit}</b> <i>(${p.name})</i></div>`).join("")}
      </div>` : ""}
    </div>

    <div style="text-align:center;font-size:8px;color:#9ca3af;margin-top:3px;">
      IRA Yoga Studio &middot; Generated ${fmt(new Date())} &middot; Cycle ${sequence.cycleNumber || 1}
    </div>

  </div>
</body>
</html>`;

  const win = window.open("", "_blank", "width=1280,height=900");
  win.document.write(html);
  win.document.close();
  win.onload = () => setTimeout(() => win.print(), 800);
}
