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

// Función para obtener el color de la sección según el nivel académico o sección específica
export function getSectionColor(levelOrSection: string): string {
  // Si es un nivel académico directo, usar ese
  switch (levelOrSection) {
    case "Preschool":
    case "Mi Taller":
      return "border-purple-500 bg-purple-50 dark:bg-purple-950/20";
    case "Elementary":
      return "border-green-500 bg-green-50 dark:bg-green-950/20";
    case "Middle School":
      return "border-blue-500 bg-blue-50 dark:bg-blue-950/20";
    case "High School":
      return "border-orange-500 bg-orange-50 dark:bg-orange-950/20";
    default:
      // Si no es un nivel directo, intentar determinar el nivel de la sección
      const normalizedSection = levelOrSection.toLowerCase().trim();
      
      // High School patterns
      if (normalizedSection.includes('décimo') || normalizedSection.includes('decimo') || 
          normalizedSection.includes('undécimo') || normalizedSection.includes('undecimo') ||
          normalizedSection.includes('decimo segundo')) {
        return "border-orange-500 bg-orange-50 dark:bg-orange-950/20";
      }
      
      // Middle School patterns
      if (normalizedSection.includes('sexto') || normalizedSection.includes('septimo') || 
          normalizedSection.includes('séptimo') || normalizedSection.includes('octavo') ||
          normalizedSection.includes('noveno')) {
        return "border-blue-500 bg-blue-50 dark:bg-blue-950/20";
      }
      
      // Elementary patterns
      if (normalizedSection.includes('segundo') || normalizedSection.includes('tercero') ||
          normalizedSection.includes('cuarto') || normalizedSection.includes('quinto')) {
        return "border-green-500 bg-green-50 dark:bg-green-950/20";
      }
      
      // Preschool patterns
      if (normalizedSection.includes('kinder') || normalizedSection.includes('kínder') ||
          normalizedSection.includes('primero')) {
        return "border-purple-500 bg-purple-50 dark:bg-purple-950/20";
      }
      
      return "border-gray-500 bg-gray-50 dark:bg-gray-950/20";
  }
}

// Función para obtener el color del badge de sección
export function getSectionBadgeColor(levelOrSection: string): string {
  // Si es un nivel académico directo, usar ese
  switch (levelOrSection) {
    case "Preschool":
    case "Mi Taller":
      return "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800";
    case "Elementary":
      return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800";
    case "Middle School":
      return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800";
    case "High School":
      return "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800";
    default:
      // Si no es un nivel directo, intentar determinar el nivel de la sección
      const normalizedSection = levelOrSection.toLowerCase().trim();
      
      // High School patterns
      if (normalizedSection.includes('décimo') || normalizedSection.includes('decimo') || 
          normalizedSection.includes('undécimo') || normalizedSection.includes('undecimo') ||
          normalizedSection.includes('decimo segundo')) {
        return "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800";
      }
      
      // Middle School patterns
      if (normalizedSection.includes('sexto') || normalizedSection.includes('septimo') || 
          normalizedSection.includes('séptimo') || normalizedSection.includes('octavo') ||
          normalizedSection.includes('noveno')) {
        return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800";
      }
      
      // Elementary patterns
      if (normalizedSection.includes('segundo') || normalizedSection.includes('tercero') ||
          normalizedSection.includes('cuarto') || normalizedSection.includes('quinto')) {
        return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800";
      }
      
      // Preschool patterns
      if (normalizedSection.includes('kinder') || normalizedSection.includes('kínder') ||
          normalizedSection.includes('primero')) {
        return "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800";
      }
      
      return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/30 dark:text-gray-300 dark:border-gray-800";
  }
}
