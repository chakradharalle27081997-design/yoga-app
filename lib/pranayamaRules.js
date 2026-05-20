export const PRANAYAMA_RULES = [
  {
    name: "Deep Belly Breathing",
    sanskrit: "Diaphragmatic Breathing",
    description: "Calms the nervous system and reduces stress",
    reason: "Gentle and safe for all conditions",
    contraindications: [],
    contraindicationReason: null,
  },
  {
    name: "Alternate Nostril Breathing",
    sanskrit: "Nadi Shodhana",
    description: "Balances left and right brain hemispheres",
    reason: "Calming and balancing, safe for most conditions",
    contraindications: [],
    contraindicationReason: null,
  },
  {
    name: "Bee Breath",
    sanskrit: "Bhramari Pranayama",
    description: "Calms anxiety and reduces stress",
    reason: "Soothes the nervous system, reduces anger and anxiety",
    contraindications: [],
    contraindicationReason: null,
  },
  {
    name: "Box Breathing",
    sanskrit: "Sama Vritti",
    description: "Equal ratio breathing for balance and calm",
    reason: "Regulates the nervous system, safe for all",
    contraindications: [],
    contraindicationReason: null,
  },
  {
    name: "Cooling Breath",
    sanskrit: "Sheetali Pranayama",
    description: "Cools the body and calms the mind",
    reason: "Lowers body temperature and blood pressure naturally",
    contraindications: ["Asthma", "Constipation"],
    contraindicationReason: "Cooling effect can worsen respiratory issues and sluggish digestion",
  },
  {
    name: "Victorious Breath",
    sanskrit: "Ujjayi Pranayama",
    description: "Ocean breath for focus and gentle heat",
    reason: "Builds focus and gentle warmth without raising BP",
    contraindications: [],
    contraindicationReason: null,
  },
  {
    name: "Yoga Nidra Rest",
    sanskrit: "Yoga Nidra",
    description: "Guided deep relaxation and integration",
    reason: "Complete rest, safe and beneficial for all conditions",
    contraindications: [],
    contraindicationReason: null,
  },
  {
    name: "Skull Shining Breath",
    sanskrit: "Kapalabhati",
    description: "Energising breath for mental clarity",
    reason: null,
    contraindications: ["High Blood Pressure", "Heart Condition", "Epilepsy", "Anxiety", "Migraine", "Asthma", "Diabetes Type 1", "Diabetes Type 2"],
    contraindicationReason: "Forceful exhalations raise intra-abdominal pressure and stimulate the nervous system — unsafe with these conditions",
  },
  {
    name: "Bellows Breath",
    sanskrit: "Bhastrika Pranayama",
    description: "Energising and detoxifying breath",
    reason: null,
    contraindications: ["High Blood Pressure", "Heart Condition", "Epilepsy", "Anxiety", "Migraine", "Asthma", "Slipped Disk"],
    contraindicationReason: "Rapid forceful breathing dramatically increases heart rate and blood pressure — avoid with these conditions",
  },
  {
    name: "Alternate Nostril Fast",
    sanskrit: "Surya Bhedana",
    description: "Right nostril breathing to energise",
    reason: null,
    contraindications: ["High Blood Pressure", "Heart Condition", "Anxiety", "Migraine"],
    contraindicationReason: "Activates sympathetic nervous system — can spike blood pressure and trigger anxiety or migraines",
  },
  {
    name: "Breath Retention",
    sanskrit: "Kumbhaka",
    description: "Breath holding for energy and focus",
    reason: null,
    contraindications: ["High Blood Pressure", "Heart Condition", "Epilepsy", "Asthma", "Anxiety"],
    contraindicationReason: "Breath retention increases intrathoracic pressure — dangerous with cardiac or respiratory conditions",
  },
  {
    name: "Forceful Exhale",
    sanskrit: "Rechaka Pranayama",
    description: "Forceful exhalation to release tension",
    reason: null,
    contraindications: ["Slipped Disk", "Back Pain", "Heart Condition"],
    contraindicationReason: "Strains the lower back and increases cardiac load — unsafe with these conditions",
  },
];

export function getPranayamaRecommendations(conditions = [], injuries = []) {
  const allConditions = [...conditions, ...injuries];

  const recommended = [];
  const notRecommended = [];

  for (const p of PRANAYAMA_RULES) {
    const blockedBy = p.contraindications.filter(c => allConditions.includes(c));
    if (blockedBy.length > 0) {
      notRecommended.push({
        ...p,
        blockedBy,
      });
    } else {
      recommended.push(p);
    }
  }

  // Return max 5 recommended
  return {
    recommended: recommended.slice(0, 5),
    notRecommended,
  };
}
