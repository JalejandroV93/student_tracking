#!/usr/bin/env tsx

import { sincronizarDesdeSupabase } from "../src/lib/sync";
import fs from "fs";
import path from "path";

// Función para asegurar que existe el directorio de logs
function asegurarDirectorioLogs() {
  const logDir = path.join(process.cwd(), "logs");
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
  return logDir;
}

// Función para escribir a un archivo de log
function escribirLog(mensaje: string) {
  const logDir = asegurarDirectorioLogs();
  const fecha = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  const logFile = path.join(logDir, `sync-${fecha}.log`);

  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${mensaje}\n`;

  fs.appendFileSync(logFile, logMessage);
  console.log(mensaje);
}

async function main() {
  escribirLog("Iniciando proceso de sincronización");

  try {
    await sincronizarDesdeSupabase();
    escribirLog("Sincronización completada exitosamente");
    process.exit(0);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido";

    escribirLog(`ERROR: ${errorMessage}`);
    escribirLog(
      `Stack: ${error instanceof Error ? error.stack : "No disponible"}`
    );
    process.exit(1);
  }
}

// Iniciar el proceso
main();
