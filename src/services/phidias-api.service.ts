// src/services/phidias-api.service.ts

export interface PhidiasItem {
  itemName: string;
  itemDescription: string;
  itemvalue: string | number;
}

export interface PhidiasRecord {
  id: number;
  person: number;
  personFirstname: string;
  personLastname: string;
  code: number;
  author: number;
  authorFirstname: string;
  authorLastname: string;
  last_editor: number;
  timestamp: number;
  last_edit: number;
  items: PhidiasItem[];
}

export interface PhidiasPollResponse {
  id: number;
  year: {
    id: number;
    name: string;
  };
  name: string;
  description: string;
  start_date: number;
  end_date: number | null;
  single_record: number;
  records: PhidiasRecord[];
}

export interface PhidiasSyncResult {
  success: boolean;
  data?: PhidiasPollResponse;
  error?: string;
  rateLimited?: boolean;
  retryAfter?: number;
}

// Rate limiting configuration
interface RateLimitConfig {
  maxRetries: number;
  baseDelayMs: number;
  maxDelayMs: number;
  backoffFactor: number;
}

class PhidiasApiService {
  private baseUrl: string;
  private apiToken: string;
  private rateLimitConfig: RateLimitConfig;
  private lastRequestTime = 0;
  private minRequestInterval = 1000; // 1 segundo entre requests

  constructor() {
    this.baseUrl = process.env.PHIDIAS_BASE_URL || 'https://liceotaller.phidias.co';
    this.apiToken = process.env.PHIDIAS_API_TOKEN || '';
    
    if (!this.apiToken) {
      throw new Error('PHIDIAS_API_TOKEN no está configurado en las variables de entorno');
    }

    this.rateLimitConfig = {
      maxRetries: 3,
      baseDelayMs: 1000,
      maxDelayMs: 30000,
      backoffFactor: 2,
    };
  }

  /**
   * Espera para respetar el rate limiting
   */
  private async waitForRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.minRequestInterval) {
      const waitTime = this.minRequestInterval - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.lastRequestTime = Date.now();
  }

  /**
   * Realiza una petición HTTP con retry y manejo de rate limiting
   */
  private async makeRequest(url: string, retryCount = 0): Promise<PhidiasSyncResult> {
    try {
      await this.waitForRateLimit();

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        // Timeout de 30 segundos
        signal: AbortSignal.timeout(30000),
      });

      // Verificar rate limiting (código 429)
      if (response.status === 429) {
        const retryAfter = parseInt(response.headers.get('Retry-After') || '60');
        
        if (retryCount < this.rateLimitConfig.maxRetries) {
          const delayMs = Math.min(
            this.rateLimitConfig.baseDelayMs * Math.pow(this.rateLimitConfig.backoffFactor, retryCount),
            this.rateLimitConfig.maxDelayMs
          );
          
          console.warn(`Rate limited by Phidias API. Waiting ${delayMs}ms before retry ${retryCount + 1}/${this.rateLimitConfig.maxRetries}`);
          
          await new Promise(resolve => setTimeout(resolve, delayMs));
          return this.makeRequest(url, retryCount + 1);
        }
        
        return {
          success: false,
          error: 'Rate limit exceeded',
          rateLimited: true,
          retryAfter,
        };
      }

      // Verificar otros errores HTTP
      if (!response.ok) {
        return {
          success: false,
          error: `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      const data: PhidiasPollResponse = await response.json();
      
      return {
        success: true,
        data,
      };

    } catch (error) {
      if (error instanceof Error) {
        // Retry en caso de errores de red
        if (retryCount < this.rateLimitConfig.maxRetries && 
            (error.name === 'TimeoutError' || error.message.includes('fetch'))) {
          
          const delayMs = Math.min(
            this.rateLimitConfig.baseDelayMs * Math.pow(this.rateLimitConfig.backoffFactor, retryCount),
            this.rateLimitConfig.maxDelayMs
          );
          
          console.warn(`Network error, retrying in ${delayMs}ms: ${error.message}`);
          
          await new Promise(resolve => setTimeout(resolve, delayMs));
          return this.makeRequest(url, retryCount + 1);
        }
        
        return {
          success: false,
          error: `Network error: ${error.message}`,
        };
      }
      
      return {
        success: false,
        error: 'Unknown error occurred',
      };
    }
  }

  /**
   * Obtiene los seguimientos de un estudiante desde Phidias
   */
  async getSeguimientosEstudiante(
    pollId: number, 
    personId: number
  ): Promise<PhidiasSyncResult> {
    const url = `${this.baseUrl}/rest/1/polls?poll=${pollId}&person=${personId}`;
    
    console.log(`Fetching seguimientos for student ${personId} from poll ${pollId}`);
    
    return this.makeRequest(url);
  }

  /**
   * Procesa múltiples estudiantes con rate limiting automático
   */
  async processBatchStudents(
    students: Array<{ id: number; phidias_id: number }>,
    pollIds: number[],
    onProgress?: (processed: number, total: number) => void
  ): Promise<Array<{ studentId: number; pollId: number; result: PhidiasSyncResult }>> {
    const results: Array<{ studentId: number; pollId: number; result: PhidiasSyncResult }> = [];
    const total = students.length * pollIds.length;
    let processed = 0;

    for (const student of students) {
      for (const pollId of pollIds) {
        try {
          console.log(`\n=== PROCESSING STUDENT ${student.id} (PHIDIAS ID: ${student.phidias_id}) FOR POLL ${pollId} ===`);
          const result = await this.getSeguimientosEstudiante(pollId, student.id);
          console.log(`Processed student ${student.id} for poll ${pollId}: ${result.success ? 'Success' : 'Failed'}`);
          console.log(`Result:`, result);
          results.push({
            studentId: student.id,
            pollId,
            result,
          });

          processed++;
          
          // Llamar callback de progreso si se proporciona
          if (onProgress) {
            onProgress(processed, total);
          }

          // Si hay rate limiting, aumentar el delay
          if (result.rateLimited) {
            console.warn(`Rate limited, increasing delay to ${this.minRequestInterval * 2}ms`);
            this.minRequestInterval = Math.min(this.minRequestInterval * 2, 5000);
          } else if (result.success) {
            // Restaurar delay normal si la petición fue exitosa
            this.minRequestInterval = Math.max(this.minRequestInterval * 0.9, 1000);
          }

        } catch (error) {
          console.error(`Error processing student ${student.id} with poll ${pollId}:`, error);
          
          results.push({
            studentId: student.id,
            pollId,
            result: {
              success: false,
              error: error instanceof Error ? error.message : 'Unknown error',
            },
          });

          processed++;
          if (onProgress) {
            onProgress(processed, total);
          }
        }
      }
    }

    return results;
  }

  /**
   * Valida la configuración del servicio
   */
  validateConfiguration(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.baseUrl) {
      errors.push('PHIDIAS_BASE_URL no está configurado');
    }

    if (!this.apiToken) {
      errors.push('PHIDIAS_API_TOKEN no está configurado');
    }

    // Validar formato del token (debería ser una cadena no vacía)
    if (this.apiToken && this.apiToken.trim().length === 0) {
      errors.push('PHIDIAS_API_TOKEN está vacío');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Test de conectividad con la API de Phidias
   */
  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      // Usar un poll y persona conocidos para testing
      const testResult = await this.getSeguimientosEstudiante(651, 4021);
      
      if (testResult.success) {
        return { success: true };
      } else {
        return { 
          success: false, 
          error: testResult.error || 'Unknown error during connection test' 
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

// Instancia singleton del servicio
export const phidiasApiService = new PhidiasApiService();

export default PhidiasApiService;