#!/usr/bin/env node

/**
 * Script ejecutable para generar token Bearer
 * Uso: node scripts/generate-token.js
 */

const crypto = require('crypto');

function generateSecureToken() {
  // Generar 32 bytes aleatorios y convertir a base64url
  const randomBytes = crypto.randomBytes(32);
  return randomBytes.toString('base64url');
}

function createTokenWithMetadata() {
  const now = Math.floor(Date.now() / 1000); // Unix timestamp
  const oneYear = 365 * 24 * 60 * 60; // 1 año en segundos
  
  const metadata = {
    purpose: 'manual-sync-api',
    issued_at: now,
    expires_at: now + oneYear,
    version: '1.0'
  };
  
  const token = generateSecureToken();
  
  return { token, metadata };
}

function formatForEnvFile(token, metadata) {
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
  
  console.log('🚀 Ejemplos de uso del token:');
  console.log('\n1. Verificar secciones no sincronizadas:');
  console.log('   GET /api/v1/phidias/manual-sync/status');
  console.log('   Headers: Authorization: Bearer ' + token);
  
  console.log('\n2. Sincronización completa (asíncrona):');
  console.log('   POST /api/v1/phidias/manual-sync');
  console.log('   Headers: Authorization: Bearer ' + token);
  console.log('   Body: { "syncAll": true, "async": true }');
  
  console.log('\n3. Sincronización por nivel:');
  console.log('   POST /api/v1/phidias/manual-sync');
  console.log('   Headers: Authorization: Bearer ' + token);
  console.log('   Body: { "specificLevel": "Elementary", "async": true }');
  
  console.log('\n4. Verificar estado de sincronización:');
  console.log('   GET /api/v1/phidias/manual-sync/status/{syncId}');
  console.log('   Headers: Authorization: Bearer ' + token);
  
  console.log('\n⚠️  IMPORTANTE:');
  console.log('   - Guarda este token de forma segura');
  console.log('   - No lo compartas en repositorios públicos');
  console.log('   - Úsalo solo para automatización con N8N');
  console.log('   - Regenera si es comprometido');
  console.log('   - El token expira en 1 año');
  
  return { token, metadata };
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main();
}

module.exports = { generateSecureToken, createTokenWithMetadata, formatForEnvFile };