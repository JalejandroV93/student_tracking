// src/lib/constantes.ts

export const NIVELES = {
    "Preschool": [
        "kinder 4 a",
        "kinder 4 b",
        "kinder 5 a",
        "kinder 5 b",
        "primero a",
        "primero b",
    ],
    "Elementary": [
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
    "Preschool": "Preschool",
    "Elementary": "Elementary",
    "Middle School": "Middle School",
    "High School": "High School",
} as const;


//  Simplified section categorization function.
export function getSectionCategory(grado: string | undefined): string {
    if (!grado) {
        return "Unknown";
    }

    const gradoLower = grado.toLowerCase();

    for (const category in NIVELES) {
        if (NIVELES[category as keyof typeof NIVELES].some(nivel => gradoLower.includes(nivel))) {
            return category;
        }
    }
    return "Unknown";
}

// Normalizes the infraction type.
export function normalizarTipoFalta(tipo: string | undefined): "I" | "II" | "III" | undefined {
    if (!tipo) {
        return undefined;
    }
  const normalized = Object.keys(TIPOS_FALTA).find(key => TIPOS_FALTA[key as keyof typeof TIPOS_FALTA] === tipo) as keyof typeof TIPOS_FALTA | undefined;
    return normalized ? TIPOS_FALTA[normalized] : undefined;
}

