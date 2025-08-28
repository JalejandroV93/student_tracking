/**
 * Utilidades para asignar nivel académico basado en la sección
 */

// Función para normalizar texto: elimina acentos, convierte a minúsculas, etc.
export function normalizarTexto(texto: string): string {
  if (!texto) return "";

  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Eliminar acentos
    .trim();
}

// Función para asignar el nivel académico según la sección normalizada
export function asignarNivelAcademico(seccion: string): string {
  const seccionNormalizada = normalizarTexto(seccion);

  // Definir niveles y sus secciones correspondientes
  const niveles = {
    "Mi Taller": [
      "kinder 1 a",
      "kinder 2 a",
      "kinder 2 b",
      "kinder 2 c",
      "kinder 3 a",
      "kinder 3 b",
    ],
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
  };

  // Función para encontrar la mejor coincidencia
  function encontrarMejorCoincidencia(
    seccionNormalizada: string,
    listaGrados: string[]
  ): boolean {
    // Ordenar los grados por longitud (descendente) para verificar primero los más específicos
    const gradosOrdenados = [...listaGrados]
      .map((grado) => normalizarTexto(grado))
      .sort((a, b) => b.length - a.length);

    // Buscar coincidencia exacta primero
    for (const grado of gradosOrdenados) {
      if (seccionNormalizada === grado) {
        return true;
      }
    }

    // Si no hay coincidencia exacta, buscar si comienza con algún grado
    for (const grado of gradosOrdenados) {
      if (seccionNormalizada.startsWith(grado)) {
        return true;
      }
    }

    // Para casos como "décimo a" cuando tenemos "decimo a" en la lista
    // Verificar palabras clave específicas
    if (
      seccionNormalizada.includes("decimo segundo") ||
      seccionNormalizada.includes("decimo2") ||
      seccionNormalizada.includes("12")
    ) {
      return listaGrados.some((g) => g.includes("decimo segundo"));
    }

    if (
      seccionNormalizada.includes("decimo") ||
      seccionNormalizada.includes("10")
    ) {
      return listaGrados.some(
        (g) => g.includes("decimo") && !g.includes("segundo")
      );
    }

    if (
      seccionNormalizada.includes("undecimo") ||
      seccionNormalizada.includes("11")
    ) {
      return listaGrados.some((g) => g.includes("undecimo"));
    }

    return false;
  }

  // Iterar sobre los niveles y encontrar la coincidencia correcta
  for (const [nivel, grados] of Object.entries(niveles)) {
    if (encontrarMejorCoincidencia(seccionNormalizada, grados)) {
      return nivel;
    }
  }

  // Método de respaldo basado en palabras clave si no se encuentra una coincidencia directa
  if (
    seccionNormalizada.includes("decimo segundo") ||
    seccionNormalizada.includes("12")
  ) {
    return "High School";
  } else if (
    seccionNormalizada.includes("decimo") ||
    seccionNormalizada.includes("11") ||
    seccionNormalizada.includes("undecimo") ||
    seccionNormalizada.includes("10")
  ) {
    return "High School";
  } else if (
    seccionNormalizada.includes("noveno") ||
    seccionNormalizada.includes("octavo") ||
    seccionNormalizada.includes("septimo") ||
    seccionNormalizada.includes("sexto") ||
    seccionNormalizada.includes("9") ||
    seccionNormalizada.includes("8") ||
    seccionNormalizada.includes("7") ||
    seccionNormalizada.includes("6")
  ) {
    return "Middle School";
  } else if (
    seccionNormalizada.includes("quinto") ||
    seccionNormalizada.includes("cuarto") ||
    seccionNormalizada.includes("tercero") ||
    seccionNormalizada.includes("segundo") ||
    seccionNormalizada.includes("5") ||
    seccionNormalizada.includes("4") ||
    seccionNormalizada.includes("3") ||
    seccionNormalizada.includes("2")
  ) {
    return "Elementary";
  } else if (
    seccionNormalizada.includes("primero") ||
    seccionNormalizada.includes("kinder 5") ||
    seccionNormalizada.includes("kinder 4") ||
    seccionNormalizada.includes("1") ||
    seccionNormalizada.includes("k5") ||
    seccionNormalizada.includes("k4")
  ) {
    return "Preschool";
  } else if (
    seccionNormalizada.includes("kinder 3") ||
    seccionNormalizada.includes("kinder 2") ||
    seccionNormalizada.includes("kinder 1") ||
    seccionNormalizada.includes("k3") ||
    seccionNormalizada.includes("k2") ||
    seccionNormalizada.includes("k1")
  ) {
    return "Mi Taller";
  }

  // Si no se encuentra ninguna coincidencia, devolvemos un valor predeterminado
  return "No definido";
}

/**
 * Extrae el número de falta del texto de "Falta según Manual de Convivencia"
 * Busca el primer número al inicio del texto
 */
export function extraerNumeroFalta(faltaText: string): number | null {
  if (!faltaText) return null;

  const match = faltaText.match(/^(\d+)/);
  return match ? parseInt(match[1], 10) : null;
}
