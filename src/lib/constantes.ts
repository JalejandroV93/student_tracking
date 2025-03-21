export const NIVELES = {
    "Mi Taller": [
        "kinder 1 a",
        "kinder 2 a",
        "kinder 2 b",
        "kinder 2 c",
        "kinder 3 a",
        "kinder 3 b",
    ],
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
    "Mi Taller": "Mi Taller",
    "Preschool": "Preschool",
    "Elementary": "Elementary",
    "Middle School": "Middle School",
    "High School": "High School",
} as const;



export function getSectionCategory(className: string): string {
    const classNameLower = className.toLowerCase();
    for (const category in NIVELES) {
        if (NIVELES[category as keyof typeof NIVELES].some(nivel => nivel.toLowerCase() === classNameLower)) {
            return category;
        }
    }
    return "Unknown"; // Or some default category
}


export function normalizarSeccion(seccion: string): string {
    const seccionLower = seccion.toLowerCase();

    // Buscar en cada sección académica
    for (const [seccionAcademica, niveles] of Object.entries(NIVELES)) {
        if (niveles.some(nivel => seccionLower.includes(nivel.toLowerCase()))) {
            return seccionAcademica;
        }
    }

    return seccion;
}

export function normalizarNivel(seccion: string, nivel: string): string {
    const nivelLower = nivel.toLowerCase();
    const seccionNormalizada = normalizarSeccion(seccion);

    const niveles = NIVELES[seccionNormalizada as keyof typeof NIVELES];
    if (!niveles) return nivel;

    const nivelEncontrado = niveles.find(n => nivelLower.includes(n.toLowerCase()));
    return nivelEncontrado || nivel;
}

export function normalizarTipoFalta(tipo: string): string {
    return TIPOS_FALTA[tipo as keyof typeof TIPOS_FALTA] || tipo;
}