import { prisma } from "../src/lib/prisma";

async function testTrimestres() {
  try {
    console.log("Verificando conexión a la base de datos...");

    // Verificar años escolares
    const schoolYears = await prisma.schoolYear.findMany({
      include: { trimestres: true },
    });

    console.log("Años escolares encontrados:", schoolYears.length);
    schoolYears.forEach((sy) => {
      console.log(
        `  - ${sy.name} (${
          sy.isActive ? "Activo" : "Inactivo"
        }) - Trimestres: ${sy.trimestres.length}`
      );
    });

    // Verificar trimestres directamente
    const trimestres = await prisma.trimestre.findMany({
      include: { schoolYear: true },
    });

    console.log("\nTrimestres encontrados:", trimestres.length);
    trimestres.forEach((t) => {
      console.log(`  - ${t.name} (${t.schoolYear.name})`);
    });
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testTrimestres();
