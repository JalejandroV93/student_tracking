// Check current trimester configuration
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkConfiguration() {
  try {
    console.log("📊 Verificando configuración de trimestres...\n");

    const activeSchoolYear = await prisma.schoolYear.findFirst({
      where: { isActive: true },
      include: {
        trimestres: {
          orderBy: { order: "asc" },
        },
      },
    });

    if (!activeSchoolYear) {
      console.log("❌ No hay año escolar activo configurado");
      return;
    }

    console.log("🏫 Año Escolar Activo:");
    console.log(`   Nombre: ${activeSchoolYear.name}`);
    console.log(
      `   Inicio: ${activeSchoolYear.startDate.toISOString().split("T")[0]}`
    );
    console.log(
      `   Fin: ${activeSchoolYear.endDate.toISOString().split("T")[0]}`
    );
    console.log("");

    console.log("📅 Trimestres configurados:");
    activeSchoolYear.trimestres.forEach((t) => {
      console.log(`   ${t.order}. ${t.name}`);
      console.log(`      Inicio: ${t.startDate.toISOString().split("T")[0]}`);
      console.log(`      Fin: ${t.endDate.toISOString().split("T")[0]}`);
      console.log("");
    });

    // Test specific dates
    console.log("🧪 Pruebas de fechas del CSV:");
    const testDates = ["2025-08-27", "2025-08-26", "2025-08-20"];

    for (const dateStr of testDates) {
      const date = new Date(dateStr);
      console.log(`\n📅 Fecha: ${dateStr}`);

      const trimestre = activeSchoolYear.trimestres.find((t) => {
        return date >= t.startDate && date <= t.endDate;
      });

      if (trimestre) {
        console.log(`   ✅ Está en: ${trimestre.name} (${trimestre.order})`);
      } else {
        console.log(`   ❌ No está en ningún trimestre configurado`);
        console.log(`   📊 Comparaciones:`);
        activeSchoolYear.trimestres.forEach((t) => {
          console.log(
            `      ${t.name}: ${date >= t.startDate ? "✓" : "✗"}inicio, ${
              date <= t.endDate ? "✓" : "✗"
            }fin`
          );
        });
      }
    }
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkConfiguration();
