# Chatbot Consejero Educativo IA

## Descripción

El Chatbot Consejero Educativo IA es una funcionalidad integrada en la página de detalles del estudiante que proporciona recomendaciones pedagógicas personalizadas basadas en el historial de faltas y seguimientos del estudiante.

## Características

- **Análisis Contextual**: Analiza automáticamente las faltas del estudiante y genera un contexto personalizado
- **Recomendaciones Personalizadas**: Proporciona estrategias específicas basadas en el tipo y frecuencia de las faltas
- **Interfaz Intuitiva**: Usa AI Elements para una experiencia de usuario fluida
- **System Prompt Dinámico**: El prompt se ajusta automáticamente según los datos del estudiante
- **Conversación Natural**: Permite interactuar de forma conversacional para obtener consejos específicos

## Componentes Utilizados

### AI Elements
- `Conversation`: Maneja la interfaz de chat
- `PromptInput`: Entrada de texto del usuario
- `Response`: Renderiza las respuestas del AI en formato markdown
- `Message`: Estructura los mensajes del chat
- `Context`: Manejo del contexto de la conversación

### API Endpoint
- **Ruta**: `/api/v1/student-advisor`
- **Método**: POST
- **Modelo**: OpenAI GPT-4o-mini
- **Streaming**: Sí

## Configuración

### Variables de Entorno Requeridas

```bash
OPENAI_API_KEY=your_openai_api_key_here
```

### Dependencias

```json
{
  "ai": "^5.0.39",
  "@ai-sdk/react": "latest",
  "@ai-sdk/openai": "latest",
  "streamdown": "^1.2.0"
}
```

## Uso

1. Navega a la página de detalles de un estudiante (`/dashboard/students/[id]`)
2. En la columna derecha verás el componente "Consejero Educativo IA"
3. Haz clic en "Iniciar Consulta" para expandir el chat
4. Escribe tu pregunta sobre estrategias educativas para el estudiante

### Ejemplos de Preguntas

- "¿Qué estrategias recomiendas para este estudiante?"
- "¿Cómo puedo mejorar la comunicación con él/ella?"
- "¿Qué plan de seguimiento sugieres?"
- "¿Cuáles podrían ser las causas de estas faltas?"

## System Prompt

El system prompt se genera dinámicamente basado en:

- Información básica del estudiante (nombre, grado)
- Análisis de comportamiento (total de faltas, faltas sin atender, tipos más frecuentes)
- Detalles de faltas recientes
- Historial de seguimientos

El prompt está diseñado para actuar como un consejero educativo profesional que proporciona:

1. Estrategias pedagógicas personalizadas
2. Recomendaciones de intervención
3. Técnicas de comunicación efectiva
4. Recursos y herramientas para el manejo de comportamiento
5. Identificación de posibles causas subyacentes
6. Planes de seguimiento estructurados

## Arquitectura

```
├── components/students/advisor/
│   ├── StudentAdvisorChatbot.tsx    # Componente principal
│   └── index.ts                     # Exportaciones
├── app/api/v1/student-advisor/
│   └── route.ts                     # Endpoint API
└── app/dashboard/students/[id]/
    └── page.tsx                     # Página integrada
```

## Personalización

### Modificar el System Prompt

Edita la función `generateSystemPrompt` en `/app/api/v1/student-advisor/route.ts`

### Cambiar el Modelo AI

Modifica la configuración del modelo en el endpoint:

```typescript
model: openai('gpt-4o-mini') // Cambiar por el modelo deseado
```

### Personalizar la Interfaz

El componente `StudentAdvisorChatbot` es completamente personalizable a través de props de className y estilos CSS.

## Consideraciones de Seguridad

- El system prompt no es visible en el frontend
- Los datos del estudiante se procesan de forma segura
- Se recomienda implementar rate limiting en producción
- Verificar permisos de usuario antes de permitir acceso al chatbot

## Limitaciones

- Requiere conexión a internet para funcionar
- Depende de la API de OpenAI
- El costo se basa en tokens utilizados
- Las recomendaciones son sugerencias, no reemplazan el juicio profesional

## Soporte

Para soporte técnico o personalizaciones adicionales, consulta la documentación de AI SDK: https://ai-sdk.dev/
