import { getWarmupPoses } from "./warmupLibrary.js";
import { getPosesForPhase } from "./asanaLibrary.js";
import { getPranayamaRecommendations } from "./pranayamaRules.js";

function calcSplit(total) {
  const warmup = Math.round(total * 0.25);
  const pranayama = Math.round(total * 0.17);
  const asanas = total - warmup - pranayama;
  return { warmup, asanas, pranayama };
}

function calcPoseCounts(warmup, asanas, pranayama, overrideAsanaCount = null) {
  const warmupCount    = 10;
  const asanasCount    = overrideAsanaCount || Math.max(4, Math.round(asanas / 4));
  const pranayamaCount = Math.max(2, Math.round(pranayama / 4));
  const warmupPerPose    = Math.round(warmup / warmupCount);
  const asanasPerPose    = Math.round(asanas / asanasCount);
  const pranayamaPerPose = Math.round(pranayama / pranayamaCount);
  return { warmupCount, asanasCount, pranayamaCount, warmupPerPose, asanasPerPose, pranayamaPerPose };
}

function buildOllamaPrompt({ client, session, cycleNumber, previousPoses, warmupPoses }) {
  const injuries   = client.injuries?.length   > 0 ? client.injuries.join(", ")   : "none";
  const conditions = client.conditions?.length > 0 ? client.conditions.join(", ") : "none";
  const surgeries  = client.surgeries?.length  > 0 ? client.surgeries.join(", ")  : "none";
  const prev       = previousPoses.length      > 0 ? previousPoses.slice(0, 5).join(", ") : "none";
  const total      = parseInt(session.duration) || 60;
  const { warmup, asanas, pranayama } = calcSplit(total);
  const counts = calcPoseCounts(warmup, asanas, pranayama);
  const ollamaAsanas   = Math.min(counts.asanasCount, 4);
  const olamaPranayama = Math.min(counts.pranayamaCount, 2);

  const warmupJSON = warmupPoses.slice(0, counts.warmupCount).map(p =>
    `{"name":"${p.name}","sanskrit":"${p.sanskrit}","duration":"${counts.warmupPerPose} min","description":"${p.description}","cues":["10 counts","Move slowly"],"modification":null}`
  ).join(",\n      ");

  // Get safe asanas and pranayama from libraries
  const clientLevel = client.experience === "advanced" ? "advanced" : client.experience === "intermediate" ? "intermediate" : "beginner";
  const safeAsanas = getPosesForPhase("Asanas", client.injuries || [], client.conditions || [], clientLevel);
  const safePranayama = getPranayamaRecommendations(client.conditions || [], client.injuries || []);
  const safeAsanaNames = safeAsanas.filter(p => !previousPoses.includes(p.name)).map(p => p.name).slice(0, 20).join(", ");
  const safePranayamaNames = safePranayama.recommended.map(p => p.name).join(", ");

  // Surgery rules using full dictionary
  const surgeryRules = [];
  if (surgeries !== "none") {
    const surgeryMap = {
      "shoulder": "NO Cobra, Sphinx, Cat-Cow, Downward Dog, Plank, Chaturanga, Side Plank. NO arms raised overhead. Arms at sides only.",
      "arm":      "NO Cobra, Sphinx, Cat-Cow, Downward Dog, Plank, Chaturanga, Side Plank. NO arms raised overhead. Arms at sides only.",
      "knee":     "NO deep squats, Garland, Hero Pose, kneeling, deep lunges.",
      "heart":    "NO inversions, NO Kapalabhati, NO breath retention.",
      "cardiac":  "NO inversions, NO Kapalabhati, NO breath retention.",
      "hip":      "NO Pigeon, NO Lotus, NO deep lunges, NO crossing legs.",
      "spine":    "NO forward folds, NO twists, NO backbends. Spine neutral only.",
      "back":     "NO forward folds, NO twists, NO backbends. Spine neutral only.",
      "disc":     "NO forward folds, NO twists, NO backbends. Spine neutral only.",
      "neck":     "NO headstands, NO shoulder stands, NO neck stretches.",
      "cervical": "NO headstands, NO shoulder stands, NO neck stretches.",
      "eye":      "NO inversions, NO forward folds below heart level.",
      "retina":   "NO inversions, NO forward folds below heart level.",
      "hernia":   "NO core work, NO Boat Pose, NO Plank.",
      "wrist":    "NO weight on hands, NO Downward Dog, NO Plank.",
      "ankle":    "NO standing balance, NO Warriors, NO lunges.",
      "elbow":    "NO arm weight bearing, NO Plank, NO Chaturanga.",
    };
    const addedRules = new Set();
    for (const [keyword, rule] of Object.entries(surgeryMap)) {
      if (surgeries.toLowerCase().includes(keyword) && !addedRules.has(rule)) {
        surgeryRules.push(rule);
        addedRules.add(rule);
      }
    }
  }

  return `Return ONLY valid JSON. No text before or after.

Client: ${client.name}, ${client.age}yo, ${client.experience}
Injuries: ${injuries}
Conditions: ${conditions}
Recent surgeries: ${surgeries}
Goal: ${session.goal}
Avoid previous poses: ${prev}

${surgeryRules.length > 0 ? `SURGERY SAFETY — STRICTLY FOLLOW:\n${surgeryRules.join("\n")}` : ""}

SAFE ASANAS for this client (choose from these only):
${safeAsanaNames}

SAFE PRANAYAMA for this client (choose from these only):
${safePranayamaNames}

{
  "title": "${session.style} Cycle ${cycleNumber} for ${client.name}",
  "totalPoses": ${counts.warmupCount + ollamaAsanas + olamaPranayama},
  "cycleNumber": ${cycleNumber},
  "safetyNotes": ["Listen to your body"],
  "phases": [
    {"phase": "Warm-up", "duration": "${warmup} min", "poses": [
      ${warmupJSON}
    ]},
    {"phase": "Asanas", "duration": "${asanas} min", "poses": [
      {"name": "Mountain Pose", "sanskrit": "Tadasana", "duration": "${counts.asanasPerPose} min", "description": "Grounds the body", "cues": ["Stand tall"], "modification": null},
      {"name": "Bridge Pose", "sanskrit": "Setu Bandhasana", "duration": "${counts.asanasPerPose} min", "description": "Back strength", "cues": ["Press feet down"], "modification": null},
      {"name": "Supine Spinal Twist", "sanskrit": "Jathara Parivartanasana", "duration": "${counts.asanasPerPose} min", "description": "Releases back", "cues": ["Keep shoulders down"], "modification": null},
      {"name": "Reclining Bound Angle", "sanskrit": "Supta Baddha Konasana", "duration": "${counts.asanasPerPose} min", "description": "Hip opener", "cues": ["Relax hips"], "modification": null}
    ]},
    {"phase": "Pranayama", "duration": "${pranayama} min", "poses": [
      {"name": "Bee Breath", "sanskrit": "Bhramari Pranayama", "duration": "${counts.pranayamaPerPose} min", "description": "Calms nervous system", "cues": ["Hum on exhale"], "modification": null},
      {"name": "Savasana", "sanskrit": "Savasana", "duration": "${counts.pranayamaPerPose} min", "description": "Full rest", "cues": ["Relax completely"], "modification": null}
    ]}
  ]
}

Replace ONLY Asanas and Pranayama with poses from the SAFE ASANAS and SAFE PRANAYAMA lists above. Strictly follow surgery rules. Avoid: ${prev}. Return ONLY JSON.`;
}

export function buildPrompt({ client, session, forOllama = false, cycleNumber = 1, previousPoses = [], asanaCount = null }) {
  const clientConditions = Array.isArray(client.conditions) ? client.conditions : [];
  const clientInjuries   = Array.isArray(client.injuries)   ? client.injuries   : [];
  const clientLevel      = client.experience === "advanced" ? "advanced" : client.experience === "intermediate" ? "intermediate" : "beginner";

  const warmupPoses = getWarmupPoses(clientConditions, clientInjuries);
  const warmupList  = warmupPoses.map(p => p.name + " (" + p.sanskrit + ")").join(", ");

  // Get safe asanas from library — filtered by injuries, conditions, level
  const safeAsanas = getPosesForPhase("Asanas", clientInjuries, clientConditions, clientLevel);
  const safeAsanasFiltered = safeAsanas.filter(p => !previousPoses.includes(p.name));
  const safeAsanaList = safeAsanasFiltered.map(p => `${p.name} (${p.sanskrit}) — ${p.description}`).join("\n");

  // Get safe pranayama from library — filtered by conditions
  const pranayamaResult = getPranayamaRecommendations(clientConditions, clientInjuries);
  const safePranayamaList = pranayamaResult.recommended.map(p => `${p.name} (${p.sanskrit}) — ${p.description}`).join("\n");
  const unsafePranayamaList = pranayamaResult.notRecommended.map(p => `${p.name} — AVOID: ${p.contraindicationReason}`).join("\n");

  if (forOllama) return buildOllamaPrompt({ client, session, cycleNumber, previousPoses, warmupPoses });

  const injuries      = clientInjuries.length      > 0 ? clientInjuries.join(", ")                          : "none";
  const conditions    = clientConditions.length    > 0 ? clientConditions.join(", ")                        : "none";
  const surgeries     = client.surgeries?.length   > 0 ? client.surgeries.join(", ")                        : "none";
  const familyHistory = client.familyHistory?.length > 0 ? client.familyHistory.join(", ")                  : "none";
  const total         = parseInt(session.duration) || 60;
  const { warmup, asanas, pranayama } = calcSplit(total);
  const counts = calcPoseCounts(warmup, asanas, pranayama, asanaCount);

  const previousPosesText = previousPoses.length > 0
    ? `PREVIOUS CYCLE POSES (do NOT repeat any of these):\n${previousPoses.join(", ")}`
    : "This is the first cycle for this client.";

  const cycleText = cycleNumber === 1
    ? "Cycle 1 — foundation. Very gentle, basic poses only, short holds."
    : cycleNumber <= 3
    ? `Cycle ${cycleNumber} — build on foundation. New poses, slightly longer holds, gentle challenges.`
    : cycleNumber <= 6
    ? `Cycle ${cycleNumber} — intermediate. More challenging variations, deeper stretches, balance work.`
    : cycleNumber <= 10
    ? `Cycle ${cycleNumber} — advanced. Complex poses, strength building, longer holds. Client is experienced now.`
    : `Cycle ${cycleNumber} — expert level. Push boundaries safely, advanced variations, full expression of poses.`;

  // Build surgery safety rules
  const surgeryRules = [];
  if (surgeries !== "none") {
    const surgeryMap = {
      "shoulder": "SHOULDER/ARM SURGERY: STRICTLY FORBIDDEN — Bhujangasana, Cobra, Sphinx, Cat-Cow, Downward Dog, Plank, Chaturanga, Side Plank, any pose where hands OR forearms touch floor with weight. NO arms raised overhead. Arms stay at sides or on knees only.",
      "arm":      "SHOULDER/ARM SURGERY: STRICTLY FORBIDDEN — Bhujangasana, Cobra, Sphinx, Cat-Cow, Downward Dog, Plank, Chaturanga, Side Plank, any pose where hands OR forearms touch floor with weight. NO arms raised overhead. Arms stay at sides or on knees only.",
      "knee":     "KNEE SURGERY: NO deep squats, Garland Pose, Hero Pose, kneeling poses, or deep lunges. Reduce knee bend in all Warrior poses.",
      "heart":    "HEART SURGERY: NO inversions, NO Kapalabhati, NO breath retention, NO intense poses. Keep heart rate low.",
      "cardiac":  "HEART SURGERY: NO inversions, NO Kapalabhati, NO breath retention, NO intense poses. Keep heart rate low.",
      "abdominal":"ABDOMINAL SURGERY: NO core crunches, NO Boat Pose, NO intense twists. Minimal abdominal engagement.",
      "cesarean": "ABDOMINAL SURGERY: NO core crunches, NO Boat Pose, NO intense twists. Minimal abdominal engagement.",
      "hip":      "HIP SURGERY: NO deep hip rotations, NO Pigeon Pose, NO Lotus, NO deep lunges, NO crossing legs. Keep hip movement minimal and controlled.",
      "spine":    "SPINE/BACK SURGERY: NO forward folds, NO deep twists, NO backbends. Keep spine neutral. No Camel, Wheel, or any spinal flexion/extension.",
      "back":     "SPINE/BACK SURGERY: NO forward folds, NO deep twists, NO backbends. Keep spine neutral. No Camel, Wheel, or any spinal flexion/extension.",
      "disc":     "SPINE/BACK SURGERY: NO forward folds, NO deep twists, NO backbends. Keep spine neutral. No Camel, Wheel, or any spinal flexion/extension.",
      "lumbar":   "SPINE/BACK SURGERY: NO forward folds, NO deep twists, NO backbends. Keep spine neutral. No Camel, Wheel, or any spinal flexion/extension.",
      "neck":     "NECK/CERVICAL SURGERY: NO headstands, NO shoulder stands, NO neck rolls, NO deep neck stretches. Keep head neutral always.",
      "cervical": "NECK/CERVICAL SURGERY: NO headstands, NO shoulder stands, NO neck rolls, NO deep neck stretches. Keep head neutral always.",
      "eye":      "EYE/RETINA SURGERY: NO inversions, NO Downward Dog, NO forward folds below heart level. Keep head above heart at all times.",
      "retina":   "EYE/RETINA SURGERY: NO inversions, NO Downward Dog, NO forward folds below heart level. Keep head above heart at all times.",
      "hernia":   "HERNIA SURGERY: NO core strengthening, NO Boat Pose, NO Plank, NO heavy lifting poses. Keep abdominal pressure minimal.",
      "bypass":   "BYPASS/OPEN HEART SURGERY: NO chest opening poses, NO inversions, NO intense breathing, NO poses that strain the sternum. Very gentle restorative only.",
      "open heart":"BYPASS/OPEN HEART SURGERY: NO chest opening poses, NO inversions, NO intense breathing, NO poses that strain the sternum. Very gentle restorative only.",
      "angioplasty":"BYPASS/OPEN HEART SURGERY: NO chest opening poses, NO inversions, NO intense breathing. Very gentle restorative only.",
      "wrist":    "WRIST SURGERY: NO weight bearing on hands, NO Downward Dog, NO Plank, NO Chaturanga. Use fists or forearms for any floor poses.",
      "ankle":    "ANKLE SURGERY: NO standing balance poses, NO Warrior poses, NO lunges. Seated and supine poses only.",
      "elbow":    "ELBOW SURGERY: NO weight bearing on arms, NO Plank, NO Chaturanga. Arms rest at sides only.",
    };
    const addedRules = new Set();
    for (const [keyword, rule] of Object.entries(surgeryMap)) {
      if (surgeries.toLowerCase().includes(keyword) && !addedRules.has(rule)) {
        surgeryRules.push(rule);
        addedRules.add(rule);
      }
    }
  }

  // Lifestyle notes
  const lifestyleNotes = [];
  if (client.sleepPattern && client.sleepPattern.toLowerCase().includes("disturbed")) {
    lifestyleNotes.push("DISTURBED SLEEP: Include restorative forward folds, Yoga Nidra or long Savasana at end. Add Bhramari Pranayama. Avoid stimulating or energizing sequences.");
  }
  if (client.stressLevel === "High" || client.stressLevel === "Medium") {
    lifestyleNotes.push(`${client.stressLevel.toUpperCase()} STRESS: Prioritise calming, grounding poses. Include Nadi Shodhana or Bhramari in Pranayama. Avoid fast-paced sequences.`);
  }
  if (client.angerLevel === "High") {
    lifestyleNotes.push("HIGH ANGER: Include cooling poses and Sheetali or Bhramari Pranayama.");
  }

  return `You are a certified yoga instructor with 15+ years of experience.
Design a safe, effective ${total}-minute ${session.style} yoga session.

CLIENT PROFILE:
- Name: ${client.name}, Age: ${client.age}, Gender: ${client.gender || "not specified"}
- Experience: ${client.experience}
- Injuries: ${injuries}
- Medical conditions: ${conditions}
- Recent surgeries: ${surgeries}
- Family history: ${familyHistory}
- Stress level: ${client.stressLevel || "not specified"}
- Sleep pattern: ${client.sleepPattern || "not specified"}
- Anger level: ${client.angerLevel || "not specified"}
- Diet: ${client.mealType || "not specified"}
- Living situation: ${client.stayType || "not specified"}
- Notes: ${client.notes || "none"}

SESSION:
- Goal: ${session.goal}, Energy: ${session.energy}, Focus: ${session.focusArea || "full body"}
- Style: ${session.style}, Duration: ${total} min, Cycle: ${cycleNumber}

PROGRESSION: ${cycleText}
${previousPosesText}

${surgeryRules.length > 0 ? `SURGERY SAFETY — STRICTLY FOLLOW:\n${surgeryRules.join("\n")}` : ""}
${lifestyleNotes.length > 0 ? `LIFESTYLE CONSIDERATIONS:\n${lifestyleNotes.join("\n")}` : ""}

GENERAL SAFETY:
- Avoid ALL poses contraindicated for listed injuries and conditions
- Every risky pose must include a specific modification
- Hypertension: no inversions
- Pregnancy: no supine after 1st trimester, no deep twists

CUES RULE:
Cues must be breath-based teaching instructions like:
"Inhale — lift arms overhead. Exhale — fold forward. Hold 5 breaths."

WARM-UP — STRICT RULE:
Use ONLY these warm-up poses (already filtered for this client):
${warmupList}
Pick EXACTLY ${counts.warmupCount} from the above list. 10 counts each.

SAFE ASANAS — choose ONLY from this list (already filtered for this client's injuries, conditions and level):
${safeAsanaList}

SAFE PRANAYAMA — choose ONLY from this list (already filtered for this client's conditions):
${safePranayamaList}

${unsafePranayamaList ? `FORBIDDEN PRANAYAMA — DO NOT USE:\n${unsafePranayamaList}` : ""}

STRUCTURE (strictly follow):
- Warm-up:   EXACTLY ${counts.warmupCount} poses x ${counts.warmupPerPose} min = ${warmup} min
- Asanas:    EXACTLY ${counts.asanasCount} poses x ${counts.asanasPerPose} min = ${asanas} min
- Pranayama: EXACTLY ${counts.pranayamaCount} techniques x ${counts.pranayamaPerPose} min = ${pranayama} min
- Last pose must be Savasana or Yoga Nidra

Return ONLY valid JSON:
{
  "title": "descriptive title",
  "totalPoses": ${counts.warmupCount + counts.asanasCount + counts.pranayamaCount},
  "cycleNumber": ${cycleNumber},
  "warmupMins": ${warmup},
  "asanaMins": ${asanas},
  "pranayamaMins": ${pranayama},
  "safetyNotes": ["mention surgery and specific poses avoided"],
  "phases": [
    {
      "phase": "Warm-up",
      "duration": "${warmup} min",
      "poseCount": ${counts.warmupCount},
      "poses": [
        {"name": "pose name", "sanskrit": "sanskrit", "duration": "${counts.warmupPerPose} min", "description": "why safe and beneficial for this client", "cues": ["Inhale — action. Exhale — action. Hold X breaths."], "modification": "specific modification if surgery/injury, or null"}
      ]
    },
    {"phase": "Asanas",    "duration": "${asanas} min",    "poseCount": ${counts.asanasCount},    "poses": [...]},
    {"phase": "Pranayama", "duration": "${pranayama} min", "poseCount": ${counts.pranayamaCount}, "poses": [...]}
  ]
}`;
}
