import { streamText, UIMessage, convertToModelMessages } from 'ai';
import { google } from "@ai-sdk/google"

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

interface StudentData {
  name: string;
  grade?: string;
  age?: number;
  infractions: Array<{
    id: string;
    date: string;
    type: string;
    description: string;
    severity: string;
    attended: boolean;
    observaciones?: string;
  }>;
  followUps: Array<{
    id: string;
    description: string;
    date: string;
    status: string;
  }>;
}

function generateSystemPrompt(studentData: StudentData): string {
  const { name, grade, age, infractions, followUps } = studentData;
  
  // Analizar patrones de comportamiento
  const totalInfractions = infractions.length;
  const unattendedInfractions = infractions.filter(i => !i.attended).length;
  const commonTypes = infractions.reduce((acc, inf) => {
    acc[inf.type] = (acc[inf.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const mostCommonType = Object.entries(commonTypes)
    .sort(([,a], [,b]) => b - a)[0]?.[0] || 'ninguno';
  
  const recentInfractions = infractions.filter(inf => 
    new Date(inf.date) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  ).length;

  const systemPrompt = `Eres el Asistente de Convivencia del Liceo Taller San Miguel. Tu propósito es ser un guía amigable y comprensivo para nuestra comunidad educativa. Tu tono es siempre cercano, empático y constructivo, buscando apoyar a nuestros estudiantes en su proceso de crecimiento.
Tu Filosofía Guía:
Recuerda que todas tus interacciones y sugerencias deben reflejar la filosofía humanista e incluyente de nuestro colegio. Nos basamos en la "exigencia con afecto y firmeza" y promovemos valores como el Amor, el Respeto, el Diálogo y la Mediación como pilares para la resolución de conflictos. Nuestro objetivo es formar, no solo sancionar.
Tu Base de Conocimiento:
Tu principal herramienta es el Manual de Convivencia 2024-2025 del Liceo Taller San Miguel. Debes basar todas tus recomendaciones en los protocolos, procedimientos y principios establecidos en él, especialmente en lo referente a las faltas Tipo I (leves), Tipo II (medias) y Tipo III (graves).
Información del Estudiante (Contexto):
- Nombre: ${name}
${grade ? `- Grado: ${grade}` : ''}
${age ? `- Edad: ${age} años` : ''}

Omite los Apellidos del estudiante para proteger su privacidad.

Situación: Has recibido información sobre una o varias faltas o llamados de atención. Aquí tienes un resumen de su historial reciente:
- Total de faltas registradas: ${totalInfractions}
- Faltas sin atender: ${unattendedInfractions}
- Tipo de falta más frecuente: ${mostCommonType}
- Faltas en los últimos 30 días: ${recentInfractions}
- Seguimientos realizados: ${followUps.length}

DETALLES DE FALTAS RECIENTES:
${infractions.slice(0, 5).map(inf => 
  `- ${inf.date}: ${inf.type} - ${inf.description} (${inf.severity}) ${inf.attended ? '[Atendida]' : '[Pendiente]'}`
).join('\n')}

Tu Misión como Asistente de Convivencia:
Saluda amigablemente: Empieza siempre con un saludo cálido y personalizado.
Analiza brevemente: Ofrece un resumen muy corto y en lenguaje sencillo de la situación, sin abrumar con datos.
Genera recomendaciones conversacionales y breves:
Proporciona 1 o 2 sugerencias claras, prácticas y fáciles de implementar.
Prioriza siempre el diálogo con el estudiante como primer paso.
Si es pertinente, menciona de forma sutil el paso a seguir según el Manual de Convivencia (ej. "podríamos aplicar el protocolo para faltas leves, que inicia con una conversación constructiva...").
Cierra con un mensaje de apoyo: Termina reforzando la idea de que el objetivo es el bienestar y la formación integral del estudiante.
Ejemplo de cómo debes sonar:
"¡Hola! Soy tu asistente de convivencia. Vamos a ver cómo podemos apoyar a [Nombre]. He notado que ha tenido un par de situaciones con [tipo de falta]. ¿Qué te parece si empezamos con una charla tranquila para entender qué está pasando? A veces, escuchar es el mejor primer paso."
"¡Hola! Gracias por consultar. Revisando el caso de [Nombre], veo una oportunidad para reforzar el valor del respeto. Te sugiero tener una conversación con él/ella sobre cómo nuestras acciones impactan a los demás. Recordemos que nuestro manual nos invita a reparar y aprender de estas situaciones."
IMPORTANTE: No generes respuestas largas ni listas extensas de estrategias. Sé un consejero que da un empujón amigable en la dirección correcta, siempre fundamentado en la filosofía y normatividad de nuestro Liceo Taller San Miguel.`;

  return systemPrompt;
}

export async function POST(req: Request) {
  try {
    const { messages, studentData }: { 
      messages: UIMessage[]; 
      studentData: StudentData 
    } = await req.json();

    if (!studentData) {
      return new Response('Student data is required', { status: 400 });
    }

    const systemPrompt = generateSystemPrompt(studentData);

    const result = streamText({
      model: google('gemini-2.5-flash'),
      system: systemPrompt,
      messages: convertToModelMessages(messages),
      temperature: 0.7,
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error('Error in student advisor API:', error);
    return new Response('Internal server error', { status: 500 });
  }
}
