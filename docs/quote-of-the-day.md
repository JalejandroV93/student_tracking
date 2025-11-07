# Quote of the Day Feature

## Descripción

Sistema de frases inspiracionales del día que se muestra en el hero de la pantalla de login. La frase se cachea durante 24 horas para optimizar el uso de la API externa.

## Arquitectura

### Backend API
- **Endpoint**: `GET /api/v1/quote-of-the-day`
- **Proveedor**: API Ninjas Quotes API
- **Caché**: 24 horas en memoria (considerar Redis para producción)
- **Categorías**: education, wisdom, success, inspirational, knowledge

### Frontend
- **Componente**: `LoginHero.tsx`
- **Ubicación**: Footer del hero de login
- **Estilo**: Blockquote con borde izquierdo, autor y animación

## Configuración

### Variables de Entorno

```env
NINJAS_API_KEY=tu_api_key_aqui
```

Obtén tu API key gratis en: https://api-ninjas.com/

### Límites de la API
- **Free tier**: 10,000 requests/mes
- **Con caché 24h**: ~30 requests/mes
- **Rate limit**: 10 requests/segundo

## Respuesta de la API

```typescript
interface QuoteResponse {
  success: boolean;
  data?: {
    content: string;
    author: string;
    cached?: boolean;    // true si viene del caché
    fallback?: boolean;  // true si es la frase por defecto
  };
  error?: string;
}
```

## Ejemplo de Uso

```typescript
const response = await fetch('/api/v1/quote-of-the-day');
const data: QuoteResponse = await response.json();

if (data.success && data.data) {
  console.log(`"${data.data.content}" - ${data.data.author}`);
}
```

## Fallback

En caso de error en la API externa, se retorna una frase por defecto:

```
"La educación es el arma más poderosa que puedes usar para cambiar el mundo."
- Nelson Mandela
```

## Ventajas del Diseño Actual

1. ✅ **Protección de API Key**: La key nunca se expone al cliente
2. ✅ **Optimización**: Una sola petición al día a la API externa
3. ✅ **Performance**: Todos los usuarios reciben la misma frase cacheada
4. ✅ **Confiabilidad**: Fallback en caso de error
5. ✅ **Categorías relevantes**: Frases relacionadas con educación y motivación

## Mejoras Futuras

- [ ] Implementar caché persistente con Redis o base de datos
- [ ] Permitir configuración de categorías desde panel de admin
- [ ] Endpoint para obtener múltiples frases y rotarlas en el frontend
- [ ] Analytics de frases más populares
- [ ] Posibilidad de marcar frases como favoritas
