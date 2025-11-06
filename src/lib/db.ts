import { PrismaClient } from "./prisma/client";

const prisma = new PrismaClient();

export async function verificarConexionBD() {
  try {
    // Intentamos hacer una consulta simple
    await prisma.$queryRaw`SELECT 1`;
    console.log("✅ Conexión a la base de datos establecida");
    return true;
  } catch (error) {
    console.error("❌ Error al conectar con la base de datos:", error);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}
