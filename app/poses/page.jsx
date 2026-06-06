"use client";
import { useState } from "react";
import { ASANA_LIBRARY } from "@/lib/asanaLibrary";
import { getPoseImage } from "@/lib/poseImages";

const ALL_POSES = ASANA_LIBRARY["Asanas"];
const LEVELS = ["all", "beginner", "intermediate", "advanced"];

export default function PoseLibraryPage() {
  const [search, setSearch] = useState("");
  const [level, setLevel] = useState("all");
  const [selected, setSelected] = useState(null);

  const filtered = ALL_POSES.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.sanskrit.toLowerCase().includes(search.toLowerCase());
    const matchLevel = level === "all" || p.level === level;
    return matchSearch && matchLevel;
  });

  const levelColor = { beginner: "#1D9E75", intermediate: "#F59E0B", advanced: "#DC2626" };
  const levelBg = { beginner: "#E1F5EE", intermediate: "#FFFBEB", advanced: "#FEF2F2" };

  return (
    <div>
      <div className="page-header" style={{ marginBottom: "1.5rem" }}>
        <div>
          <h1 className="page-title">Pose Library</h1>
          <p className="page-subtitle">{ALL_POSES.length} asanas with instructions and images</p>
        </div>
      </div>

      {/* Search and filter */}
      <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        <input
          type="text"
          placeholder="🔍 Search by name or sanskrit..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: "200px", padding: "0.6rem 1rem", borderRadius: "8px", border: "1.5px solid var(--border)", fontSize: "0.9rem", outline: "none" }}
        />
        <div style={{ display: "flex", gap: "0.5rem" }}>
          {LEVELS.map(l => (
            <button key={l} onClick={() => setLevel(l)}
              style={{ padding: "0.5rem 1rem", borderRadius: "8px", border: `2px solid ${level === l ? (levelColor[l] || "var(--brand)") : "var(--border)"}`, background: level === l ? (levelBg[l] || "var(--brand-light)") : "white", color: level === l ? (levelColor[l] || "var(--brand)") : "var(--text-muted)", fontSize: "0.8rem", fontWeight: level === l ? 700 : 400, cursor: "pointer", textTransform: "capitalize" }}>
              {l}
            </button>
          ))}
        </div>
      </div>

      <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: "1rem" }}>{filtered.length} poses</p>

      {/* Pose grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "1rem" }}>
        {filtered.map(pose => {
          const imgSrc = getPoseImage(pose.sanskrit, "Asanas");
          return (
            <div key={pose.name} onClick={() => setSelected(pose)}
              style={{ background: "white", borderRadius: "12px", overflow: "hidden", border: "1px solid var(--border)", cursor: "pointer", transition: "transform 0.15s, box-shadow 0.15s", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.06)"; }}>
              {imgSrc
                ? <img src={imgSrc} alt={pose.name} style={{ width: "100%", height: "130px", objectFit: "contain", background: "#f9fafb", display: "block" }} onError={e => e.target.style.display = "none"} />
                : <div style={{ width: "100%", height: "130px", background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem" }}>🧘</div>
              }
              <div style={{ padding: "0.6rem 0.75rem" }}>
                <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#C0392B", marginBottom: "2px" }}>{pose.sanskrit}</div>
                <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginBottom: "6px" }}>{pose.name}</div>
                <span style={{ fontSize: "0.65rem", fontWeight: 600, padding: "2px 8px", borderRadius: "999px", background: levelBg[pose.level], color: levelColor[pose.level], textTransform: "capitalize" }}>
                  {pose.level}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pose detail popup */}
      {selected && (
        <div onClick={() => setSelected(null)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
          <div onClick={e => e.stopPropagation()}
            style={{ background: "white", borderRadius: "16px", maxWidth: "500px", width: "100%", maxHeight: "85vh", overflow: "auto" }}>
            {/* Image */}
            {getPoseImage(selected.sanskrit, "Asanas")
              ? <img src={getPoseImage(selected.sanskrit, "Asanas")} alt={selected.name} style={{ width: "100%", height: "220px", objectFit: "contain", background: "#f9fafb", borderRadius: "16px 16px 0 0" }} />
              : <div style={{ width: "100%", height: "220px", background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "4rem", borderRadius: "16px 16px 0 0" }}>🧘</div>
            }
            <div style={{ padding: "1.25rem" }}>
              {/* Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "1rem" }}>
                <div>
                  <h2 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#C0392B", marginBottom: "2px" }}>{selected.sanskrit}</h2>
                  <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontStyle: "italic" }}>{selected.name}</p>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" }}>
                  <span style={{ fontSize: "0.75rem", fontWeight: 600, padding: "3px 10px", borderRadius: "999px", background: levelBg[selected.level], color: levelColor[selected.level], textTransform: "capitalize" }}>
                    {selected.level}
                  </span>
                  <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", fontSize: "1.2rem", cursor: "pointer", color: "var(--text-muted)" }}>✕</button>
                </div>
              </div>

              {/* Benefits */}
              <div style={{ background: "#E1F5EE", borderRadius: "10px", padding: "0.75rem 1rem", marginBottom: "1rem" }}>
                <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#0F6E56", marginBottom: "4px" }}>✨ Benefits</div>
                <p style={{ fontSize: "0.82rem", color: "#0F6E56" }}>{selected.description}</p>
              </div>

              {/* Instructions */}
              <div style={{ background: "#f9fafb", borderRadius: "10px", padding: "0.75rem 1rem", marginBottom: "1rem" }}>
                <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text)", marginBottom: "6px" }}>📋 How to do</div>
                <ol style={{ paddingLeft: "1.2rem", margin: 0, display: "flex", flexDirection: "column", gap: "6px" }}>
                {selected.cues.split(".").filter(s => s.trim()).map((step, i) => (
                  <li key={i} style={{ fontSize: "0.85rem", color: "#374151", lineHeight: 1.6 }}>{step.trim()}</li>
                ))}
              </ol>
              </div>

              {/* Contraindications */}
              {selected.contraindications?.length > 0 && (
                <div style={{ background: "#FEF2F2", borderRadius: "10px", padding: "0.75rem 1rem" }}>
                  <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#DC2626", marginBottom: "4px" }}>⚠️ Avoid if</div>
                  <p style={{ fontSize: "0.82rem", color: "#DC2626" }}>{selected.contraindications.join(", ")}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
