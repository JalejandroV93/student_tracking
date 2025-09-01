// src/lib/constantes.ts
export const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

export const NIVELES: Record<string, readonly string[]> = {
  Preschool: [
    "kinder 4 a",
    "kinder 4 b",
    "kinder 5 a",
    "kinder 5 b",
    "primero a",
    "primero b",
  ],
  Elementary: [
    "segundo a",
    "segundo b",
    "tercero a",
    "tercero b",
    "cuarto a",
    "cuarto b",
    "quinto a",
    "quinto b",
  ],
  "Middle School": [
    "sexto",
    "septimo",
    "octavo",
    "noveno",
    "sexto a",
    "sexto b",
    "septimo a",
    "septimo b",
    "octavo a",
    "octavo b",
    "noveno a",
    "noveno b",
  ],
  "High School": [
    "decimo",
    "undecimo",
    "decimo segundo",
    "decimo a",
    "decimo b",
    "undecimo a",
    "undecimo b",
    "decimo segundo a",
    "decimo segundo b",
  ],
} as const;

export const TIPOS_FALTA = {
  "Tipo I": "I",
  "Tipo II": "II",
  "Tipo III": "III",
} as const;

export const SECCIONES_ACADEMICAS = {
  Preschool: "Preschool",
  Elementary: "Elementary",
  "Middle School": "Middle School",
  "High School": "High School",
} as const;

const CATEGORY_PATTERNS: Record<string, RegExp[]> = {
  "High School": [/d[ée]cimo(\s+segundo)?/, /und[ée]cimo/],
  "Middle School": [/noveno/, /octavo/, /s[eé]ptimo/, /sexto/],
  Elementary: [/quinto/, /cuarto/, /tercero/, /segundo/],
  Preschool: [/primero/, /kinder/],
};

// Optimized function
export function getSectionCategory(grado: string | undefined): string {
  if (!grado) return "Unknown";

  const gradoLower = grado.toLowerCase().trim();

  // 1. Pattern-based check
  for (const [category, patterns] of Object.entries(CATEGORY_PATTERNS)) {
    if (patterns.some((regex) => regex.test(gradoLower))) {
      return category;
    }
  }

  // 2. Exact match fallback
  for (const category in NIVELES) {
    if (NIVELES[category].includes(gradoLower)) {
      return category;
    }
  }

  return "Unknown";
}


// Normalizes the infraction type.
export function normalizarTipoFalta(
  tipo: string | undefined
): "I" | "II" | "III" | undefined {
  if (!tipo) {
    return undefined;
  }
  // Direct mapping of input to normalized type
  const normalizedType = tipo.trim().toUpperCase();
  return ["I", "II", "III"].includes(normalizedType)
    ? (normalizedType as "I" | "II" | "III")
    : undefined;
}
