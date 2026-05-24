const POSE_DATABASE = [
  "Adho Mukha Svanasana (Downward Dog).jpg",
  "Anjaneyasana (Low Lunge)_02.jpg",
  "Anulom Vilom.jpg",
  "Ardha Chakrasana (Half Wheel).jpg",
  "Ardha Matsyendrasana (Spinal Twist).jpg",
  "Ardha Navasana.jpg",
  "Ardha Navasana_01.jpg",
  "Ardha Navasana_02.jpg",
  "Ardha Phalakasana (Half Plank Pose).jpg",
  "Ashwa Sanchalanasana (Equestrian Pose).jpg",
  "Baddha Konasana  1B (Butterfly Pose).jpg",
  "Baddha Konasana (Butterfly Pose).jpg",
  "Bakasana (Crow Pose).jpg",
  "Balasana (Child's Pose).jpg",
  "Bhujangasana (Cobra).jpg",
  "Bitilasana (cat - cow Pose).jpg",
  "Chakrasana (Wheel Pose).jpg",
  "Chaturanga Dandasana.jpg",
  "Dandasana (Staff Pose) (2).jpg",
  "Dhanurasana (Bow Pose).jpg",
  "Garudasana (Eagle Pose).jpg",
  "Gomukhasana (Cow Face Pose).jpg",
  "Halasana (Plow Pose).jpg",
  "Janu Sirsasana (Head-to-Knee Pose).jpg",
  "Kakasana (Crow Variation).jpg",
  "Malasana (Garland Pose).jpg",
  "Marjariasana (Cow -cat Pose).jpg",
  "Matsyasana.jpg",
  "Mayurasana (Forearm Stand).jpg",
  "Navasana (Boat Pose).jpg",
  "Padahastasana (Standing Forward Bend).jpg",
  "Paschimottanasana (Seated Forward Bend)_02.jpg",
  "Pawanmuktasana (Wind Relieving Pose).jpg",
  "Phalakasana (Plank Pose).jpg",
  "Prasarita Padottanasana (Wide Forward Fold).jpg",
  "Sarvangasana (Shoulder Stand).jpg",
  "Setu Bandhasana (Bridge Pose).jpg",
  "Sirsasana (Headstand).jpg",
  "Tittibhasana.jpg",
  "Tri Pada Adho Mukha Svanasana ( Three-Legged Downward Dog).jpg",
  "Upavistha Konasana (Wide Angle Seated Forward Fold)_01.jpg",
  "Ustrasana (Camel Pose).jpg",
  "Utkata Konasana.jpg",
  "Utkatasana (Chair Pose).jpg",
  "Utthita Parsvakonasana (Extended Side Angle Pose).jpg",
  "Vasisthasana (Side Plank).jpg",
  "Virabhadrasana I (Warrior I).jpg",
  "Virabhadrasana II (Warrior II).jpg",
  "Virabhadrasana III (Warrior III).jpg",
  "tadasana-pose.jpg",
  "trikonasana(Triangle Pose).jpg",
  "trikonasana.jpg",
  "vrikshasana-pose.jpg",
  "Adho Mukha Baddha Konasana (Butterfly Pose Forward Fold).jpg",
  "Adho Mukha Svanasana(Downward-Facing Dog Pose).jpg",
  "Anjaneyasana (Low Lunge).jpg",
  "Ardha Hanumanasana (Half Splits Pose).jpg",
  "Ardha Kapotasana(Half Pigeon Pose).jpg",
  "Ardha Matsyendrasana(Seated Twist Pose).jpg",
  "Ardha Phalakasana(Forearm Plank).jpg",
  "Balasana (Child's Pose).jpg",
  "Balasana Baddha Hasta( Kneeling Yoga Mudra Pose).jpg",
  "Bhujangasana (Cobra Pose).jpg",
  "Bitilasana(Cow Pose).jpg",
  "Eka Pada Adho Mukha Svanasana(Three-Legged Downward-Facing Dog Pos).jpg",
  "Eka Pada Rajakapotasana.jpg",
  "Hindolasana or Shishupalasana  (Cradle the Baby Pose).png",
  "Kraunchasana(Heron Pose).jpg",
  "Marjariasana(Cat Pose).jpg",
  "Matsyasana (Fish Pose).jpg",
  "Padahastasana (Hand-to-Foot Pose).jpg",
  "Parighasana (Gate Pose).jpg",
  "Parivrtta Janu Sirsasana (Revolved Head-to-Knee Pose).jpg",
  "Parivrtta Parsvakonasana(Revolved Side Angle Pose).jpg",
  "Pawanamuktasana (Wind-Relieving Pose).jpg",
  "Pawanamuktasana(Wind-Relieving Pose).jpg",
  "Phalakasana(Plank Pose).jpg",
  "Prasarita Padottanasana(Wide-Legged Forward Fold).jpg",
  "Purvottanasana(Reverse Plank Pose).jpg",
  "Setu Bandha Sarvangasana(Bridge Pose).jpg",
  "Supta Virasana(Reclining Hero Pose).jpg",
  "Uttanasana(Standing Forward Fold Pose).jpg",
  "Utthita Anjaneyasana (High-Heeled Low Lunge).jpg",
  "Utthita Ashwa Sanchalanasana (High Lunge Pose).jpg",
  "Utthita Pada Bharmanasana (Tiger Pose).jpg",
  "Utthita Parsva Parighasana (Extended Side Gate Pose.jpg",
  "Utthita Trikonasana 1(Extended Triangle Pose).jpg",
  "Vajrasana Gomukhasana(Thunderbolt Pose with Cow Face Arms).jpg",
  "Vajrasana(Thunderbolt Pose).jpg",
  "Viparita Virabhadrasana(Reverse Warrior Pos).jpg",
  "Vrikshasana (Tree Pose).jpg",
];

// ── EXPLICIT ALIAS MAP ──────────────────────────────────────────────────────
// Every pose name / sanskrit name → exact filename in POSE_DATABASE
// Add new entries here whenever you add a new image file.
// If a pose has NO image yet, do NOT add it — it will show "No image".
const ALIAS_MAP = {
  // Tadasana
  "tadasana":                                    "tadasana-pose.jpg",
  "mountain pose":                               "tadasana-pose.jpg",

  // Adho Mukha Svanasana
  "adho mukha svanasana":                        "Adho Mukha Svanasana (Downward Dog).jpg",
  "downward dog":                                "Adho Mukha Svanasana (Downward Dog).jpg",

  // Anjaneyasana
  "anjaneyasana":                                "Anjaneyasana (Low Lunge).jpg",
  "low lunge":                                   "Anjaneyasana (Low Lunge).jpg",

  // Ardha Chakrasana
  "ardha chakrasana":                            "Ardha Chakrasana (Half Wheel).jpg",
  "half wheel":                                  "Ardha Chakrasana (Half Wheel).jpg",

  // Ardha Hanumanasana
  "ardha hanumanasana":                          "Ardha Hanumanasana (Half Splits Pose).jpg",
  "half splits":                                 "Ardha Hanumanasana (Half Splits Pose).jpg",

  // Ardha Kapotasana
  "ardha kapotasana":                            "Ardha Kapotasana(Half Pigeon Pose).jpg",
  "half pigeon":                                 "Ardha Kapotasana(Half Pigeon Pose).jpg",

  // Ardha Matsyendrasana
  "ardha matsyendrasana":                        "Ardha Matsyendrasana (Spinal Twist).jpg",
  "spinal twist":                                "Ardha Matsyendrasana (Spinal Twist).jpg",

  // Ardha Navasana
  "ardha navasana":                              "Ardha Navasana.jpg",
  "half boat":                                   "Ardha Navasana.jpg",

  // Ardha Phalakasana
  "ardha phalakasana":                           "Ardha Phalakasana (Half Plank Pose).jpg",
  "half plank":                                  "Ardha Phalakasana (Half Plank Pose).jpg",

  // Ashwa Sanchalanasana
  "ashwa sanchalanasana":                        "Ashwa Sanchalanasana (Equestrian Pose).jpg",
  "equestrian pose":                             "Ashwa Sanchalanasana (Equestrian Pose).jpg",

  // Baddha Konasana
  "baddha konasana":                             "Baddha Konasana (Butterfly Pose).jpg",
  "butterfly pose":                              "Baddha Konasana (Butterfly Pose).jpg",
  "supta baddha konasana":                       "Baddha Konasana (Butterfly Pose).jpg",
  "reclining bound angle":                       "Baddha Konasana (Butterfly Pose).jpg",

  // Adho Mukha Baddha Konasana
  "adho mukha baddha konasana":                  "Adho Mukha Baddha Konasana (Butterfly Pose Forward Fold).jpg",
  "butterfly forward fold":                      "Adho Mukha Baddha Konasana (Butterfly Pose Forward Fold).jpg",

  // Bakasana
  "bakasana":                                    "Bakasana (Crow Pose).jpg",
  "crow pose":                                   "Bakasana (Crow Pose).jpg",

  // Balasana
  "balasana":                                    "Balasana (Child's Pose).jpg",
  "child pose":                                  "Balasana (Child's Pose).jpg",
  "child's pose":                                "Balasana (Child's Pose).jpg",

  // Balasana Baddha Hasta
  "balasana baddha hasta":                       "Balasana Baddha Hasta( Kneeling Yoga Mudra Pose).jpg",
  "kneeling yoga mudra":                         "Balasana Baddha Hasta( Kneeling Yoga Mudra Pose).jpg",
  "yoga mudra":                                  "Balasana Baddha Hasta( Kneeling Yoga Mudra Pose).jpg",

  // Bhujangasana
  "bhujangasana":                                "Bhujangasana (Cobra Pose).jpg",
  "cobra pose":                                  "Bhujangasana (Cobra Pose).jpg",

  // Bitilasana / Marjariasana
  "bitilasana":                                  "Bitilasana(Cow Pose).jpg",
  "marjariasana":                                "Marjariasana(Cat Pose).jpg",
  "marjariasana / bitilasana":                   "Marjariasana (Cow -cat Pose).jpg",
  "cat cow pose":                                "Marjariasana (Cow -cat Pose).jpg",

  // Chakrasana
  "chakrasana":                                  "Chakrasana (Wheel Pose).jpg",
  "wheel pose":                                  "Chakrasana (Wheel Pose).jpg",

  // Chaturanga
  "chaturanga dandasana":                        "Chaturanga Dandasana.jpg",
  "chaturanga":                                  "Chaturanga Dandasana.jpg",

  // Dandasana
  "dandasana":                                   "Dandasana (Staff Pose) (2).jpg",
  "staff pose":                                  "Dandasana (Staff Pose) (2).jpg",

  // Dhanurasana
  "dhanurasana":                                 "Dhanurasana (Bow Pose).jpg",
  "bow pose":                                    "Dhanurasana (Bow Pose).jpg",

  // Eka Pada Rajakapotasana
  "eka pada rajakapotasana":                     "Eka Pada Rajakapotasana.jpg",
  "pigeon pose":                                 "Eka Pada Rajakapotasana.jpg",

  // Eka Pada Setu Bandhasana
  "eka pada setu bandhasana":                    "Setu Bandhasana (Bridge Pose).jpg",
  "single leg bridge":                           "Setu Bandhasana (Bridge Pose).jpg",

  // Garudasana
  "garudasana":                                  "Garudasana (Eagle Pose).jpg",
  "eagle pose":                                  "Garudasana (Eagle Pose).jpg",

  // Gomukhasana
  "gomukhasana":                                 "Gomukhasana (Cow Face Pose).jpg",
  "cow face pose":                               "Gomukhasana (Cow Face Pose).jpg",

  // Halasana
  "halasana":                                    "Halasana (Plow Pose).jpg",
  "plow pose":                                   "Halasana (Plow Pose).jpg",

  // Hindolasana
  "hindolasana":                                 "Hindolasana or Shishupalasana  (Cradle the Baby Pose).png",
  "cradle the baby":                             "Hindolasana or Shishupalasana  (Cradle the Baby Pose).png",

  // Janu Sirsasana
  "janu sirsasana":                              "Janu Sirsasana (Head-to-Knee Pose).jpg",
  "head to knee pose":                           "Janu Sirsasana (Head-to-Knee Pose).jpg",

  // Kraunchasana
  "kraunchasana":                                "Kraunchasana(Heron Pose).jpg",
  "heron pose":                                  "Kraunchasana(Heron Pose).jpg",

  // Malasana
  "malasana":                                    "Malasana (Garland Pose).jpg",
  "garland pose":                                "Malasana (Garland Pose).jpg",

  // Matsyasana
  "matsyasana":                                  "Matsyasana (Fish Pose).jpg",
  "fish pose":                                   "Matsyasana (Fish Pose).jpg",

  // Navasana
  "navasana":                                    "Navasana (Boat Pose).jpg",
  "boat pose":                                   "Navasana (Boat Pose).jpg",
  "naukasana":                                   "Navasana (Boat Pose).jpg",
  "prone boat pose":                             "Navasana (Boat Pose).jpg",

  // Padahastasana
  "padahastasana":                               "Padahastasana (Hand-to-Foot Pose).jpg",
  "hand to foot pose":                           "Padahastasana (Hand-to-Foot Pose).jpg",

  // Parighasana
  "parighasana":                                 "Parighasana (Gate Pose).jpg",
  "gate pose":                                   "Parighasana (Gate Pose).jpg",

  // Parivrtta Janu Sirsasana
  "parivrtta janu sirsasana":                    "Parivrtta Janu Sirsasana (Revolved Head-to-Knee Pose).jpg",
  "revolved head to knee":                       "Parivrtta Janu Sirsasana (Revolved Head-to-Knee Pose).jpg",

  // Parivrtta Parsvakonasana
  "parivrtta parsvakonasana":                    "Parivrtta Parsvakonasana(Revolved Side Angle Pose).jpg",
  "revolved side angle":                         "Parivrtta Parsvakonasana(Revolved Side Angle Pose).jpg",

  // Paschimottanasana
  "paschimottanasana":                           "Paschimottanasana (Seated Forward Bend)_02.jpg",
  "seated forward bend":                         "Paschimottanasana (Seated Forward Bend)_02.jpg",

  // Pawanamuktasana
  "pawanamuktasana":                             "Pawanamuktasana (Wind-Relieving Pose).jpg",
  "pawanmuktasana":                              "Pawanmuktasana (Wind Relieving Pose).jpg",
  "wind relieving pose":                         "Pawanamuktasana (Wind-Relieving Pose).jpg",
  "dwipad pawanamuktasana":                      "Pawanamuktasana (Wind-Relieving Pose).jpg",
  "double wind relieving":                       "Pawanamuktasana (Wind-Relieving Pose).jpg",
  "eka pada pawanamuktasana":                    "Eka Pada Pawanamuktasana (One-Legged Wind Relieving Pose).png",
  "eka pada pawanamuktasana variation":          "Eka Pada Pawanamuktasana (One-Legged Wind Relieving Pose)_02.png",
  "eka pada pawanamuktasana_02":                 "Eka Pada Pawanamuktasana (One-Legged Wind Relieving Pose)_02.png",
  "eka pada pawanamuktasana 02":                 "Eka Pada Pawanamuktasana (One-Legged Wind Relieving Pose)_02.png",

  // Phalakasana
  "phalakasana":                                 "Phalakasana(Plank Pose).jpg",
  "plank pose":                                  "Phalakasana(Plank Pose).jpg",

  // Prasarita Padottanasana
  "prasarita padottanasana":                     "Prasarita Padottanasana(Wide-Legged Forward Fold).jpg",
  "wide legged forward fold":                    "Prasarita Padottanasana(Wide-Legged Forward Fold).jpg",

  // Purvottanasana
  "purvottanasana":                              "Purvottanasana(Reverse Plank Pose).jpg",
  "reverse plank":                               "Purvottanasana(Reverse Plank Pose).jpg",

  // Sarvangasana
  "sarvangasana":                                "Sarvangasana (Shoulder Stand).jpg",
  "shoulder stand":                              "Sarvangasana (Shoulder Stand).jpg",

  // Setu Bandhasana
  "setu bandhasana":                             "Setu Bandhasana (Bridge Pose).jpg",
  "bridge pose":                                 "Setu Bandhasana (Bridge Pose).jpg",

  // Sirsasana
  "sirsasana":                                   "Sirsasana (Headstand).jpg",
  "headstand":                                   "Sirsasana (Headstand).jpg",

  // Supta Vajrasana / Reclined Thunderbolt
  "supta vajrasana":                             "Supta Virasana(Reclining Hero Pose).jpg",
  "reclined thunderbolt":                        "Supta Virasana(Reclining Hero Pose).jpg",

  // Supta Virasana
  "supta virasana":                              "Supta Virasana(Reclining Hero Pose).jpg",
  "reclining hero pose":                         "Supta Virasana(Reclining Hero Pose).jpg",

  // Tittibhasana
  "tittibhasana":                                "Tittibhasana.jpg",
  "firefly pose":                                "Tittibhasana.jpg",

  // Tri Pada Adho Mukha Svanasana
  "tri pada adho mukha svanasana":               "Tri Pada Adho Mukha Svanasana ( Three-Legged Downward Dog).jpg",
  "three legged downward dog":                   "Tri Pada Adho Mukha Svanasana ( Three-Legged Downward Dog).jpg",

  // Trikonasana
  "utthita trikonasana":                         "Utthita Trikonasana 1(Extended Triangle Pose).jpg",
  "triangle pose":                               "Utthita Trikonasana 1(Extended Triangle Pose).jpg",

  // Upavistha Konasana
  "upavistha konasana":                          "Upavistha Konasana (Wide Angle Seated Forward Fold)_01.jpg",
  "wide angle seated forward fold":              "Upavistha Konasana (Wide Angle Seated Forward Fold)_01.jpg",

  // Ustrasana
  "ustrasana":                                   "Ustrasana (Camel Pose).jpg",
  "camel pose":                                  "Ustrasana (Camel Pose).jpg",

  // Utkata Konasana
  "utkata konasana":                             "Utkata Konasana.jpg",
  "goddess pose":                                "Utkata Konasana.jpg",

  // Utkatasana
  "utkatasana":                                  "Utkatasana (Chair Pose).jpg",
  "chair pose":                                  "Utkatasana (Chair Pose).jpg",

  // Uttanasana
  "uttanasana":                                  "Uttanasana(Standing Forward Fold Pose).jpg",
  "standing forward bend":                       "Uttanasana(Standing Forward Fold Pose).jpg",

  // Utthita Ashwa Sanchalanasana
  "utthita ashwa sanchalanasana":                "Utthita Ashwa Sanchalanasana (High Lunge Pose).jpg",
  "high lunge":                                  "Utthita Ashwa Sanchalanasana (High Lunge Pose).jpg",

  // Utthita Pada Bharmanasana
  "utthita pada bharmanasana":                   "Utthita Pada Bharmanasana (Tiger Pose).jpg",
  "tiger pose":                                  "Utthita Pada Bharmanasana (Tiger Pose).jpg",

  // Utthita Parsva Parighasana
  "utthita parsva parighasana":                  "Utthita Parsva Parighasana (Extended Side Gate Pose.jpg",
  "extended side gate pose":                     "Utthita Parsva Parighasana (Extended Side Gate Pose.jpg",

  // Utthita Parsvakonasana
  "utthita parsvakonasana":                      "Utthita Parsvakonasana (Extended Side Angle Pose).jpg",
  "extended side angle":                         "Utthita Parsvakonasana (Extended Side Angle Pose).jpg",

  // Vajrasana
  "vajrasana":                                   "Vajrasana(Thunderbolt Pose).jpg",
  "thunderbolt pose":                            "Vajrasana(Thunderbolt Pose).jpg",

  // Vasisthasana
  "vasisthasana":                                "Vasisthasana (Side Plank).jpg",
  "side plank":                                  "Vasisthasana (Side Plank).jpg",

  // Viparita Virabhadrasana
  "viparita virabhadrasana":                     "Viparita Virabhadrasana(Reverse Warrior Pos).jpg",
  "reverse warrior":                             "Viparita Virabhadrasana(Reverse Warrior Pos).jpg",

  // Virabhadrasana
  "virabhadrasana i":                            "Virabhadrasana I (Warrior I).jpg",
  "warrior i":                                   "Virabhadrasana I (Warrior I).jpg",
  "warrior 1":                                   "Virabhadrasana I (Warrior I).jpg",
  "virabhadrasana ii":                           "Virabhadrasana II (Warrior II).jpg",
  "warrior ii":                                  "Virabhadrasana II (Warrior II).jpg",
  "warrior 2":                                   "Virabhadrasana II (Warrior II).jpg",
  "virabhadrasana iii":                          "Virabhadrasana III (Warrior III).jpg",
  "warrior iii":                                 "Virabhadrasana III (Warrior III).jpg",
  "warrior 3":                                   "Virabhadrasana III (Warrior III).jpg",

  // Vrikshasana
  "vrikshasana":                                 "Vrikshasana (Tree Pose).jpg",
  "tree pose":                                   "Vrikshasana (Tree Pose).jpg",

  // Dandayamana Bharmanasana
    "dandayamana bharmanasana":                    null,
    "balancing table pose":                        null,

  // Anantasana
    "anantasana":                                  null,
    "side reclining leg lift":                     null,

  // Salabhasana
  "salabhasana":                                   null,
  "locust pose":                                   null,

  // Jathara Parivartanasana
    "jathara parivartanasana":                     null,
    "supine spinal twist":                         null,

  // Dwipadottanasana
  "dwipadottanasana":                            "Ardha Navasana.jpg",
  "double leg raise":                            "Ardha Navasana.jpg",

  // Marichyasana
  "marichyasana":                                "Ardha Matsyendrasana (Spinal Twist).jpg",
  "sage marichi pose":                           "Ardha Matsyendrasana (Spinal Twist).jpg",

  // Chakkichalanasana
    "chakkichalanasana":                           null,
    "mill churning pose":                          null,

  // Ardha Chandrasana
    "ardha chandrasana":                           null,
    "half moon pose":                              null,

  // Natarajasana
    "natarajasana":                                null,
    "lord of dance":                               null,

  // Surya Namaskar
    "surya namaskar":                              null,
    "sun salutation":                              null,
};

// ── MAIN FUNCTION ───────────────────────────────────────────────────────────
// Exact alias lookup ONLY. No fuzzy matching. No wrong images ever.
// If pose is not in ALIAS_MAP → return null → UI shows "No image"
export function getPoseImage(poseName) {
  if (!poseName) return null;

  const key = poseName
    .toLowerCase()
    .replace(/\s*\(.*?\)/g, "")   // remove bracketed text
    .replace(/\s+/g, " ")
    .trim();

  // Try original lowercased first
  const original = poseName.toLowerCase().trim();
  if (ALIAS_MAP[original]) return `/poses/${ALIAS_MAP[original]}`;
  // Try cleaned key
  if (ALIAS_MAP[key]) return `/poses/${ALIAS_MAP[key]}`;

  
  if (ALIAS_MAP[original]) return `/poses/${ALIAS_MAP[original]}`;

  // No match — return null so UI renders "No image" placeholder
  return null;
}

export function getPhaseImage() { return null; }
export function getAllPoses() { return []; }
