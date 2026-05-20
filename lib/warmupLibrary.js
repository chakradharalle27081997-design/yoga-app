export const WARMUP_LIBRARY = [
  // ── Core 7 — always included for everyone ──
  { name: "Tadasana",                              sanskrit: "Tadasana",                    description: "Grounding standing pose, improves posture and body awareness", contraindications: [], core: true,  therapeuticTags: [] },
  { name: "Tadasana Neck Rotations",               sanskrit: "Greeva Sanchalana",           description: "Gentle neck mobility, relieves cervical tension", contraindications: [],                        core: true,  therapeuticTags: ["Cervical Spondylosis", "Migraine", "Stress"] },
  { name: "Tadasana Shoulder Rotations",           sanskrit: "Skandha Chakra",              description: "Opens shoulders, releases upper back tension", contraindications: [],                           core: true,  therapeuticTags: ["Anxiety", "Stress", "Shoulder/Arm Surgery"] },
  { name: "Tadasana Arm Rotations",                sanskrit: "Bhuja Chakra",                description: "Improves lymphatic flow and shoulder circulation", contraindications: [],                       core: true,  therapeuticTags: ["Diabetes Type 1", "Diabetes Type 2", "Cholesterol"] },
  { name: "Tadasana Hip Rotations",                sanskrit: "Shroni Chakra",               description: "Loosens hip joints, excellent for reproductive health", contraindications: [],                  core: true,  therapeuticTags: ["Weight Management", "Constipation", "Abdominal Disorders"] },
  { name: "Tadasana Knee Rotations",               sanskrit: "Janu Chakra",                 description: "Warms knee joints, improves synovial fluid", contraindications: ["Knee Cartilage Damage"],     core: true,  therapeuticTags: ["Arthritis", "Knee Injury"] },
  { name: "Tadasana Ankle Rotations",              sanskrit: "Gulpha Chakra",               description: "Improves circulation in lower limbs", contraindications: [],                                   core: true,  therapeuticTags: ["Diabetes Type 1", "Diabetes Type 2", "Cholesterol"] },

  // ── Therapeutic — picked based on client conditions ──
  { name: "Dandasana",                             sanskrit: "Dandasana",                   description: "Staff pose, strengthens spine and core", contraindications: ["Slipped Disk"],                  core: false, therapeuticTags: ["Back Pain", "Posture"] },
  { name: "Sashtangasana",                         sanskrit: "Sashtangasana",               description: "Eight limbed pose, full body grounding", contraindications: [],                                core: false, therapeuticTags: ["Anxiety", "Depression", "Stress"] },
  { name: "Savasana Hand Movements",               sanskrit: "Savasana Hasta Sanchalana",   description: "Gentle hand movements in relaxation, improves circulation", contraindications: [],            core: false, therapeuticTags: ["Anxiety", "High Blood Pressure", "Heart Condition"] },
  { name: "Vajrasana Hand Movements",              sanskrit: "Vajrasana Hasta Sanchalana",  description: "Hand movements in thunderbolt pose, aids digestion", contraindications: ["Knee Injury"],       core: false, therapeuticTags: ["Diabetes Type 1", "Diabetes Type 2", "Constipation", "Abdominal Disorders"] },
  { name: "Sukhasana Hand Movements",              sanskrit: "Sukhasana Hasta Sanchalana",  description: "Easy pose hand movements, calms nervous system", contraindications: [],                        core: false, therapeuticTags: ["Anxiety", "Depression", "Stress", "Migraine"] },
  { name: "Ardha Padmasana",                       sanskrit: "Ardha Padmasana",             description: "Half lotus, opens hips and knees gently", contraindications: ["Knee Cartilage Damage", "Knee Injury"], core: false, therapeuticTags: ["Anxiety", "Depression"] },
  { name: "Tadasana Hands Criss Cross",            sanskrit: "Hasta Kriya",                 description: "Cross arm movements, opens chest and lungs", contraindications: [],                            core: false, therapeuticTags: ["Asthma", "Anxiety", "Depression"] },
  { name: "Tadasana Abdominal Twist",              sanskrit: "Kati Chakrasana",             description: "Standing spinal twist, massages abdominal organs", contraindications: [],                      core: false, therapeuticTags: ["Weight Management", "Constipation", "Diabetes Type 1", "Diabetes Type 2", "Abdominal Disorders"] },
  { name: "Utthitha Udarakriya",                   sanskrit: "Utthitha Udarakriya",         description: "Standing abdominal exercise, strengthens core", contraindications: ["Heart Condition"],         core: false, therapeuticTags: ["Weight Management", "Constipation", "Abdominal Disorders", "Diabetes Type 1", "Diabetes Type 2"] },
  { name: "Utthita Parsvapada Uttanasana",         sanskrit: "Utthita Parsvapada Uttanasana", description: "Wide leg forward bend, stretches inner thighs", contraindications: ["Slipped Disk"],         core: false, therapeuticTags: ["Weight Management", "Cholesterol", "Back Pain"] },
  { name: "Trikonasana Abdominal Twist with Stick",sanskrit: "Trikonasana Kati Chakrasana", description: "Triangle twist with stick support, deep spinal rotation", contraindications: ["Slipped Disk"],  core: false, therapeuticTags: ["Weight Management", "Constipation", "Back Pain", "Abdominal Disorders"] },
  { name: "Utthita Udarakriya Elbow to Knee",      sanskrit: "Utthita Udarakriya Janu",     description: "Elbow to knee core activation, burns abdominal fat", contraindications: ["Heart Condition"],   core: false, therapeuticTags: ["Weight Management", "Diabetes Type 1", "Diabetes Type 2", "Abdominal Disorders"] },
  { name: "Parshva Urdhva Bhuja Kriya with Stick", sanskrit: "Parshva Urdhva Bhuja Kriya",  description: "Lateral arm raise with stick, opens sides and lungs", contraindications: ["Shoulder/Arm Surgery"], core: false, therapeuticTags: ["Asthma", "Cholesterol", "Weight Management"] },
  { name: "Urdhva Adhah Greeva Chalana with Wall Support", sanskrit: "Greeva Chalana",      description: "Up down neck movement with wall support, cervical therapy", contraindications: [],             core: false, therapeuticTags: ["Cervical Spondylosis", "Migraine", "Hair Loss"] },
  { name: "Utthita Hasta Padangusthasana",         sanskrit: "Utthita Hasta Padangusthasana", description: "Standing hand to toe, improves balance and hip flexibility", contraindications: ["Knee Injury"], core: false, therapeuticTags: ["Weight Management", "Arthritis"] },
  { name: "Trikonasana Lateral Bending with Stick",sanskrit: "Trikonasana Parshva Naman",   description: "Triangle lateral bend with stick, stretches entire side body", contraindications: ["Slipped Disk"], core: false, therapeuticTags: ["Weight Management", "Back Pain", "Cholesterol"] },
];

// Always returns core 7 + therapeutically matched extras (up to total of 10)
export function getWarmupPoses(clientConditions = [], clientInjuries = []) {
  const allContraindications = [...clientConditions, ...clientInjuries];
  const allConditions = [...clientConditions, ...clientInjuries];

  // Core poses — filter only by contraindications
  const corePoses = WARMUP_LIBRARY
    .filter(p => p.core && !p.contraindications.some(c => allContraindications.includes(c)));

  // Therapeutic extras — match client conditions, exclude contraindicated
  const therapeuticPoses = WARMUP_LIBRARY
    .filter(p =>
      !p.core &&
      !p.contraindications.some(c => allContraindications.includes(c)) &&
      p.therapeuticTags.some(t => allConditions.includes(t))
    );

  // General extras if not enough therapeutic matches
  const generalPoses = WARMUP_LIBRARY
    .filter(p =>
      !p.core &&
      !p.contraindications.some(c => allContraindications.includes(c)) &&
      !therapeuticPoses.find(tp => tp.name === p.name)
    );

  // Combine: core + therapeutic + general to reach 10
  const extras = [...therapeuticPoses, ...generalPoses].slice(0, 10 - corePoses.length);
  return [...corePoses, ...extras];
}
