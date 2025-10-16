// scripts/generate-manual-sync-token.ts
import crypto from 'crypto';

/**
 * Script para generar un token Bearer para la sincronización manual
 * Válido por 1 año
 */

interface TokenPayload {
  purpose: string;
  issued_at: number;
  expires_at: number;
  version: string;
}

function generateSecureToken(): string {
  // Generar 32 bytes aleatorios y convertir a base64url
  const randomBytes = crypto.randomBytes(32);
  return randomBytes.toString('base64url');
}

function createTokenWithMetadata(): { token: string; metadata: TokenPayload } {
  const now = Math.floor(Date.now() / 1000); // Unix timestamp
  const oneYear = 365 * 24 * 60 * 60; // 1 año en segundos
  
  const metadata: TokenPayload = {
    purpose: 'manual-sync-api',
    issued_at: now,
    expires_at: now + oneYear,
    version: '1.0'
  };
  
  const token = generateSecureToken();
  
  return { token, metadata };
}

function formatForEnvFile(token: string, metadata: TokenPayload): string {
  const expirationDate = new Date(metadata.expires_at * 1000);
  
  return `
# Token de sincronización manual generado el ${new Date().toLocaleString()}
# Válido hasta: ${expirationDate.toLocaleString()}
# Propósito: ${metadata.purpose}
MANUAL_SYNC_TOKEN=${token}
`;
}

function main() {
  console.log('🔐 Generando token Bearer para sincronización manual...\n');
  
  const { token, metadata } = createTokenWithMetadata();
  
  console.log('✅ Token generado exitosamente');
  console.log('📋 Información del token:');
  console.log(`   - Propósito: ${metadata.purpose}`);
  console.log(`   - Emitido: ${new Date(metadata.issued_at * 1000).toLocaleString()}`);
  console.log(`   - Expira: ${new Date(metadata.expires_at * 1000).toLocaleString()}`);
  console.log(`   - Versión: ${metadata.version}`);
  console.log(`   - Longitud: ${token.length} caracteres\n`);
  
  console.log('🔑 Token Bearer:');
  console.log(`${token}\n`);
  
  console.log('📝 Agregar al archivo .env:');
  console.log(formatForEnvFile(token, metadata));
  
  console.log('🚀 Uso del token:');
  console.log('   GET /api/v1/phidias/manual-sync/status');
  console.log('   Headers: Authorization: Bearer ' + token);
  console.log('');
  console.log('   POST /api/v1/phidias/manual-sync');
  console.log('   Headers: Authorization: Bearer ' + token);
  console.log('   Body: { "syncAll": true } o { "specificLevel": "Elementary" }\n');
  
  console.log('⚠️  IMPORTANTE:');
  console.log('   - Guarda este token de forma segura');
  console.log('   - No lo compartas en repositorios públicos');
  console.log('   - Úsalo solo para automatización con N8N');
  console.log('   - Regenera si es comprometido');
  
  // También retornar para uso programático
  return { token, metadata };
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main();
}

export { generateSecureToken, createTokenWithMetadata, formatForEnvFile };