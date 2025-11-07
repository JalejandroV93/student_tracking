// API Route: Quote of the Day
// Provides a daily inspirational quote cached for 24 hours
import { NextResponse } from "next/server";

interface Quote {
  content: string;
  author: string;
}

interface CachedQuote extends Quote {
  timestamp: number;
}

// In-memory cache (en producción considera usar Redis o base de datos)
let cachedQuote: CachedQuote | null = null;

// Categorías relacionadas con educación, motivación y crecimiento
const EDUCATION_CATEGORIES = "education,wisdom";

/**
 * GET /api/v1/quote-of-the-day
 * Retorna una frase del día cacheada por 24 horas
 */
export async function GET() {
  try {
    const now = Date.now();
    const ONE_DAY_MS = 24 * 60 * 60 * 1000;

    // Verificar si tenemos una frase cacheada válida
    if (cachedQuote && now - cachedQuote.timestamp < ONE_DAY_MS) {
      return NextResponse.json({
        success: true,
        data: {
          content: cachedQuote.content,
          author: cachedQuote.author,
          cached: true,
        },
      });
    }

    // Obtener nueva frase de API Ninjas
    const apiKey = process.env.NINJAS_API_KEY;
    
    if (!apiKey) {
      console.error("NINJAS_API_KEY no está configurada");
      return NextResponse.json(
        { 
          success: false, 
          error: "API key no configurada" 
        },
        { status: 500 }
      );
    }

    const response = await fetch(
      `https://api.api-ninjas.com/v2/quotes?categories=${EDUCATION_CATEGORIES}`,
      {
        headers: {
          "X-Api-Key": apiKey,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`API Ninjas error: ${response.status}`);
    }

    const data = await response.json();

    if (!data || !Array.isArray(data) || data.length === 0) {
      throw new Error("No se recibieron frases de la API");
    }

    // Cachear la nueva frase
    cachedQuote = {
      content: data[0].quote,
      author: data[0].author,
      timestamp: now,
    };

    return NextResponse.json({
      success: true,
      data: {
        content: cachedQuote.content,
        author: cachedQuote.author,
        cached: false,
      },
    });
  } catch (error) {
    console.error("Error fetching quote of the day:", error);
    
    // Retornar frase por defecto en caso de error
    return NextResponse.json({
      success: true,
      data: {
        content: "Todos los niños nacen artistas. El problema es cómo seguir siendo artistas al crecer.",
        author: "Pablo Picasso.",
        cached: false,
        fallback: true,
      },
    });
  }
}
