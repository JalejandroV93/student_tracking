/**
 * Plantillas de mensajes HTML para enviar vía Phidias
 */

export interface CredentialsTemplateData {
  fullName: string;
  username: string;
  password: string;
  url: string;
}

/**
 * Genera el HTML del mensaje de credenciales con estilos inline
 */
export function generateCredentialsHtml(data: CredentialsTemplateData): string {
  const { fullName, username, url } = data;

  return `
<div style="min-height: 100vh; padding: 40px 20px;">
  <div style="max-width: 900px; margin: 0 auto; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 15px rgba(190, 21, 34, 0.15);">
    <div style="background: linear-gradient(135deg, #be1522 0%, #8b0f18 100%); height: 10px; position: relative;">
      <div style="position: absolute; top: 0; left: 0; right: 0; height: 4px; background: linear-gradient(90deg, #be1522 0%, #e63946 50%, #be1522 100%);">
        <p>&nbsp;</p>
      </div>
    </div>
    <div style="padding: 50px 45px;">
      <div style="margin-bottom: 5px;">
        <p><strong>ESTIMADO(A) ${fullName.toUpperCase()}</strong></p>
        <div style="width: 50px; height: 3px; background: linear-gradient(90deg, #be1522, #e63946); margin-bottom: 15px;">
          <p>&nbsp;</p>
        </div>
        <p style="text-align: justify">Le informamos que se ha creado una cuenta de usuario para usted en la plataforma <strong>SGC</strong> (Sistema de Gestión de Convivencia) del Liceo Taller San Miguel. A través de esta herramienta podrá realizar el seguimiento académico y disciplinario de los estudiantes asignados.</p>
      </div>
      <div style="background: linear-gradient(135deg, #fce4e6 0%, #fef0f1 100%); padding: 25px 30px; border-radius: 15px; margin: 35px 0; border-left: 5px solid #be1522; box-shadow: 0 4px 15px rgba(190, 21, 34, 0.1);">
        <p><strong>CREDENCIALES DE ACCESO</strong></p>
        <p style="margin: 10px 0 5px 0;"><strong>Usuario:</strong> ${username}</p>
        <p style="margin: 5px 0;"><strong>Contraseña:</strong> Documento de Identificación</p>
      </div>
      <div style="text-align: center; margin: 40px 0;">
        <a href="${url}" style="text-decoration: none;">
          <div style="background: linear-gradient(135deg, #be1522 0%, #8b0f18 100%); display: inline-block; padding: 16px 40px; border-radius: 10px; box-shadow: 0 8px 20px rgba(190, 21, 34, 0.25);">
            <p style="margin: 0;"><strong><span style="color: rgb(255, 255, 255)">INGRESAR A LA PLATAFORMA</span></strong></p>
          </div>
        </a>
      </div>
      <div style="display: table; width: 100%; margin: 35px 0; border-collapse: separate; border-spacing: 15px 0;">
        <div style="display: table-row;">
          <div style="display: table-cell; width: 50%; background-color: #f8f9fa; padding: 20px; border-radius: 12px; border-top: 3px solid #be1522;">
            <p style="margin: 0 0 5px 0;"><strong>URL DE ACCESO</strong></p>
            <p style="margin: 0;"><a href="${url}" style="color: #be1522; text-decoration: none;">${url}</a></p>
          </div>
        </div>
      </div>
      <div style="margin-top: 15px; padding-top: 10px; border-top: 2px solid #e9ecef;">
        <p>Quedo atento.</p>
        <p><strong>Cordialmente,</strong></p>
      </div>
    </div>
    <div style="height: 2px; background: linear-gradient(90deg, transparent 0%, #be1522 25%, #e63946 50%, #be1522 75%, transparent 100%); margin: 0 45px;">
      <p>&nbsp;</p>
    </div>
    <div style="padding: 45px; background: linear-gradient(180deg, #ffffff 0%, #f8f9fa 100%);">
      <p><img src="https://phidias-storage-1.s3.amazonaws.com/liceotaller/files/library/5260/Jhon_Alejandro_Vasquez_Morales.png" alt="Firma Digital" style="max-width: 100%; height: auto; display: block; margin: 0 auto; border-radius: 12px;"></p>
      <div style="text-align: center; margin-top: 15px; padding-top: 15px; border-top: 1px solid #e9ecef; font-size: 9px;">
        <p><em>Este mensaje es confidencial y puede contener información privilegiada.</em></p>
        <p><em>Si ha recibido este correo por error, favor notificar al remitente.</em></p>
      </div>
    </div>
    <div style="height: 6px; background: linear-gradient(90deg, #be1522 0%, #8b0f18 50%, #be1522 100%);">
      <p>&nbsp;</p>
    </div>
  </div>
</div>
`.trim();
}

/**
 * Genera el asunto por defecto para el mensaje de credenciales
 */
export function getDefaultCredentialsSubject(): string {
  return "Credenciales de acceso - Sistema Gestión de Convivencia (SGC)";
}

/**
 * URL de la plataforma
 */
export const PLATFORM_URL = process.env.NEXT_PUBLIC_PLATFORM_URL || "https://tracking.liceotallersanmiguel.edu.co/";

/**
 * ID del remitente por defecto en Phidias
 */
export const DEFAULT_SENDER_ID = parseInt(process.env.PHIDIAS_SENDER_ID || "5260", 10);
