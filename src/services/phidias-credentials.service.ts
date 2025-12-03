/**
 * Servicio para enviar credenciales de acceso a través de la API de Phidias
 */

import {
  generateCredentialsHtml,
  getDefaultCredentialsSubject,
  PLATFORM_URL,
  DEFAULT_SENDER_ID,
} from "@/lib/message-templates";

export interface SendCredentialsRequest {
  phidiasId: string;
  fullName: string;
  username: string;
  password: string;
  subject?: string;
}

export interface SendCredentialsResponse {
  success: boolean;
  message?: string;
  error?: string;
  phidiasResponse?: unknown;
}

export interface BulkSendCredentialsRequest {
  users: Array<{
    userId: string;
    phidiasId: string;
    fullName: string;
    username: string;
    password: string;
  }>;
  subject?: string;
}

export interface BulkSendCredentialsResponse {
  success: boolean;
  total: number;
  sent: number;
  failed: number;
  results: Array<{
    userId: string;
    username: string;
    success: boolean;
    error?: string;
  }>;
}

class PhidiasCredentialsService {
  private baseUrl: string;
  private apiToken: string;
  private senderId: number;

  constructor() {
    this.baseUrl =
      process.env.PHIDIAS_BASE_URL || "https://liceotaller.phidias.co";
    this.apiToken = process.env.PHIDIAS_API_TOKEN || "";
    this.senderId = DEFAULT_SENDER_ID;

    if (!this.apiToken) {
      console.warn(
        "PHIDIAS_API_TOKEN no está configurado - el envío de credenciales no funcionará"
      );
    }
  }

  /**
   * Envía un mensaje con credenciales a un usuario a través de Phidias
   */
  async sendCredentials(
    request: SendCredentialsRequest
  ): Promise<SendCredentialsResponse> {
    const { phidiasId, fullName, username, password, subject } = request;

    if (!this.apiToken) {
      return {
        success: false,
        error: "PHIDIAS_API_TOKEN no está configurado",
      };
    }

    if (!phidiasId) {
      return {
        success: false,
        error: "El usuario no tiene ID de Phidias configurado",
      };
    }

    try {
      const messageHtml = generateCredentialsHtml({
        fullName,
        username,
        password,
        url: PLATFORM_URL,
      });

      const payload = {
        sender: this.senderId,
        people: phidiasId,
        subject: subject || getDefaultCredentialsSubject(),
        type: "Mensaje",
        message: messageHtml,
      };

      const response = await fetch(`${this.baseUrl}/rest/1/message/send/api`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiToken}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(30000),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          `Error de Phidias API: ${response.status} - ${errorText}`
        );

        if (response.status === 429) {
          return {
            success: false,
            error: "Límite de peticiones excedido. Intenta más tarde.",
          };
        }

        return {
          success: false,
          error: `Error de Phidias: ${response.status} - ${response.statusText}`,
        };
      }

      const phidiasResponse = await response.json();

      return {
        success: true,
        message: "Credenciales enviadas exitosamente",
        phidiasResponse,
      };
    } catch (error) {
      console.error("Error al enviar credenciales:", error);

      if (error instanceof Error) {
        if (error.name === "TimeoutError") {
          return {
            success: false,
            error: "Tiempo de espera agotado al comunicarse con Phidias",
          };
        }
        return {
          success: false,
          error: `Error de red: ${error.message}`,
        };
      }

      return {
        success: false,
        error: "Error desconocido al enviar credenciales",
      };
    }
  }

  /**
   * Envía credenciales a múltiples usuarios
   */
  async sendBulkCredentials(
    request: BulkSendCredentialsRequest
  ): Promise<BulkSendCredentialsResponse> {
    const { users, subject } = request;
    const results: BulkSendCredentialsResponse["results"] = [];

    let sent = 0;
    let failed = 0;

    for (const user of users) {
      // Pequeño delay entre peticiones para respetar rate limits
      if (results.length > 0) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      const result = await this.sendCredentials({
        phidiasId: user.phidiasId,
        fullName: user.fullName,
        username: user.username,
        password: user.password,
        subject,
      });

      if (result.success) {
        sent++;
        results.push({
          userId: user.userId,
          username: user.username,
          success: true,
        });
      } else {
        failed++;
        results.push({
          userId: user.userId,
          username: user.username,
          success: false,
          error: result.error,
        });
      }
    }

    return {
      success: failed === 0,
      total: users.length,
      sent,
      failed,
      results,
    };
  }

  /**
   * Valida si el servicio está configurado correctamente
   */
  isConfigured(): boolean {
    return Boolean(this.apiToken);
  }
}

// Instancia singleton del servicio
export const phidiasCredentialsService = new PhidiasCredentialsService();

export default PhidiasCredentialsService;
