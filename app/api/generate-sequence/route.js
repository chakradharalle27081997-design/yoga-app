import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { buildPrompt } from "@/lib/promptBuilder";

function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`Timed out after ${ms}ms`)), ms)
    ),
  ]);
}

async function callOllama(prompt) {
  const res = await withTimeout(
    fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3.2:3b",
        prompt,
        stream: false,
        options: { temperature: 0.7, num_predict: 2000 },
      }),
    }),
    90000
  );
  if (!res.ok) throw new Error(`Ollama HTTP error: ${res.status}`);
  const data = await res.json();
  const raw = data.response || "";
  if (!raw || raw.trim().length < 10) throw new Error("Ollama returned empty response");
  const jsonStart = raw.indexOf("{");
  if (jsonStart === -1) throw new Error("No JSON found in Ollama response");
  let jsonStr = raw.slice(jsonStart);
  const jsonEnd = jsonStr.lastIndexOf("}");
  if (jsonEnd === -1) { jsonStr = jsonStr + ']}]}'; } else { jsonStr = jsonStr.slice(0, jsonEnd + 1); }
  try { return JSON.parse(jsonStr); } catch {
    const fixed = jsonStr.replace(/,\s*}/g, '}').replace(/,\s*]/g, ']').replace(/\n/g, ' ');
    return JSON.parse(fixed);
  }
}

async function callMistral(prompt) {
  const res = await withTimeout(
    fetch("https://api.mistral.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + process.env.MISTRAL_API_KEY,
      },
      body: JSON.stringify({
        model: "mistral-small-latest",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 8000,
        response_format: { type: "json_object" },
      }),
    }),
    60000
  );
  if (!res.ok) {
    const err = await res.text();
    throw new Error("Mistral HTTP error: " + res.status + " " + err);
  }
  const data = await res.json();
  if (!data.choices?.[0]?.message?.content) throw new Error("Mistral empty response");
  const raw = data.choices[0].message.content;
  const jsonStart = raw.indexOf("{");
  const jsonEnd = raw.lastIndexOf("}");
  if (jsonStart === -1) throw new Error("No JSON in Mistral response");
  const jsonStr = raw.slice(jsonStart, jsonEnd + 1);
  try { return JSON.parse(jsonStr); } catch {
    const fixed = jsonStr.replace(/,\s*}/g, '}').replace(/,\s*]/g, ']');
    return JSON.parse(fixed);
  }
}

async function callOpenRouter(prompt) {
  const res = await withTimeout(
    fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": "Bearer " + process.env.OPENROUTER_API_KEY, "HTTP-Referer": "http://localhost:3000" },
      body: JSON.stringify({ model: "meta-llama/llama-3.3-70b-instruct:free", messages: [{ role: "user", content: prompt }], temperature: 0.7, max_tokens: 8000 }),
    }),
    60000
  );
  if (!res.ok) throw new Error("OpenRouter HTTP error: " + res.status);
  const data = await res.json();
  if (!data.choices?.[0]?.message?.content) throw new Error("OpenRouter empty response");
  const raw = data.choices[0].message.content;
  const jsonStart = raw.indexOf("{");
  const jsonEnd = raw.lastIndexOf("}");
  if (jsonStart === -1) throw new Error("No JSON in OpenRouter response");
  const jsonStr = raw.slice(jsonStart, jsonEnd + 1);
  try { return JSON.parse(jsonStr); } catch {
    const fixed = jsonStr.replace(/,\s*}/g, '}').replace(/,\s*]/g, ']');
    return JSON.parse(fixed);
  }
}

async function callGemini(prompt, model = "gemini-2.5-flash") {
  const res = await withTimeout(
    fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 16384, temperature: 0.7, responseMimeType: "application/json" },
        }),
      }
    ),
    60000
  );
  if (!res.ok) { const err = await res.text(); throw new Error(`Gemini error: ${err}`); }
  const data = await res.json();
  const rawText = data.candidates[0].content.parts[0].text;
  return JSON.parse(rawText.replace(/```json|```/g, "").trim());
}

async function generateWithRetry(ollamaPrompt, geminiPrompt) {
  const attempts = [
    { name: "Mistral Small",         fn: () => callMistral(geminiPrompt) },
    { name: "Ollama llama3.2:3b",    fn: () => callOllama(ollamaPrompt) },
    { name: "OpenRouter Llama 70b",  fn: () => callOpenRouter(geminiPrompt) },
    { name: "Gemini 2.5 Flash",      fn: () => callGemini(geminiPrompt, "gemini-2.5-flash") },
    { name: "Gemini 2.0 Flash",      fn: () => callGemini(geminiPrompt, "gemini-2.0-flash") },
    { name: "Gemini Flash Lite",     fn: () => callGemini(geminiPrompt, "gemini-2.0-flash-lite") },
  ];
  for (let i = 0; i < attempts.length; i++) {
    try {
      console.log(`Trying ${attempts[i].name}...`);
      const result = await attempts[i].fn();
      if (!result || !result.phases || !Array.isArray(result.phases) || result.phases.length === 0) {
        throw new Error("Invalid response structure");
      }
      console.log(`Success with ${attempts[i].name}`);
      return result;
    } catch (err) {
      console.warn(`${attempts[i].name} failed:`, err.message);
      if (i < attempts.length - 1) {
        await new Promise(r => setTimeout(r, i === 0 ? 1000 : 2000));
      } else {
        throw new Error(`All AI providers failed. Last error: ${err.message}`);
      }
    }
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { clientId, duration, manual, sequenceJSON, session: bodySession, asanaCount } = body;

    const raw = await prisma.client.findUnique({
      where: { id: clientId },
      include: { sequences: { orderBy: { createdAt: "desc" } } },
    });
    if (!raw) return NextResponse.json({ error: "Client not found" }, { status: 404 });

    const client = {
      ...raw,
      injuries:      raw.injuries      ? raw.injuries.split(",").filter(Boolean)      : [],
      conditions:    raw.conditions    ? raw.conditions.split(",").filter(Boolean)    : [],
      goals:         raw.goals         ? raw.goals.split(",").filter(Boolean)         : [],
      surgeries:     raw.surgeries     ? raw.surgeries.split(",").filter(Boolean)     : [],
      familyHistory: raw.familyHistory ? raw.familyHistory.split(",").filter(Boolean) : [],
      mealType:      raw.mealType      || "",
      stayType:      raw.stayType      || "",
    };

    const cycleNumber = (raw.sequences?.length || 0) + 1;
    let previousPoses = [];
    if (raw.sequences?.length > 0) {
      try {
        previousPoses = [...new Set(
          raw.sequences.flatMap(s => {
            try {
              return JSON.parse(s.poses).phases?.flatMap(p => p.poses.map(x => x.name)) || [];
            } catch { return []; }
          })
        )];
      } catch { previousPoses = []; }
    }







    const activeDuration = parseInt(bodySession?.duration || duration) || 60;
    const session = {
      duration:  activeDuration,
      style:     bodySession?.style     || "Hatha",
      goal:      bodySession?.goal      || client.goals?.[0] || "General wellness",
      energy:    bodySession?.energy    || "moderate",
      focusArea: bodySession?.focusArea || "Full body",
    };

    let finalSequenceJSON;

    if (manual && sequenceJSON) {
      finalSequenceJSON = { ...sequenceJSON, cycleNumber };
    } else {
      const ollamaPrompt = buildPrompt({ client, session, forOllama: true,  cycleNumber, previousPoses });
      const geminiPrompt = buildPrompt({ client, session, forOllama: false, cycleNumber, previousPoses, asanaCount });
      finalSequenceJSON = await generateWithRetry(ollamaPrompt, geminiPrompt);
    }

    const saved = await prisma.sequence.create({
      data: {
        clientId,
        title:       finalSequenceJSON.title       || `${session.style} Cycle ${cycleNumber}`,
        duration:    activeDuration,
        style:       session.style,
        goal:        session.goal,
        energy:      session.energy,
        cycleNumber,
        asanaCount: asanaCount || 6,
        poses:       JSON.stringify(finalSequenceJSON),
      },
      include: { client: true },
    });

    return NextResponse.json({
      success: true,
      sequence: { ...saved, poses: finalSequenceJSON },
    });
  } catch (err) {
    console.error("Generate sequence error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
