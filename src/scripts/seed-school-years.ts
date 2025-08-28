import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seedSchoolYears() {
  console.log("🌱 Seeding school years...");

  // Crear año escolar 2024-2025
  const schoolYear2024 = await prisma.schoolYear.create({
    data: {
      name: "2024-2025",
      startDate: new Date("2024-07-23"),
      endDate: new Date("2025-06-14"),
      isActive: true,
      description: "Año escolar 2024-2025",
      trimestres: {
        create: [
          {
            name: "Primer Trimestre",
            order: 1,
            startDate: new Date("2024-07-23"),
            endDate: new Date("2024-11-13"),
          },
          {
            name: "Segundo Trimestre",
            order: 2,
            startDate: new Date("2024-11-14"),
            endDate: new Date("2025-03-06"),
          },
          {
            name: "Tercer Trimestre",
            order: 3,
            startDate: new Date("2025-03-07"),
            endDate: new Date("2025-06-14"),
          },
        ],
      },
    },
    include: {
      trimestres: true,
    },
  });

  console.log(`✅ Created school year: ${schoolYear2024.name}`);
  console.log(`   Trimestres: ${schoolYear2024.trimestres.length}`);

  // Crear año escolar 2025-2026 (como ejemplo histórico)
  const schoolYear2025 = await prisma.schoolYear.create({
    data: {
      name: "2025-2026",
      startDate: new Date("2025-07-22"),
      endDate: new Date("2026-06-13"),
      isActive: false,
      description: "Año escolar 2025-2026 (futuro)",
      trimestres: {
        create: [
          {
            name: "Primer Trimestre",
            order: 1,
            startDate: new Date("2025-07-22"),
            endDate: new Date("2025-11-12"),
          },
          {
            name: "Segundo Trimestre",
            order: 2,
            startDate: new Date("2025-11-13"),
            endDate: new Date("2026-03-05"),
          },
          {
            name: "Tercer Trimestre",
            order: 3,
            startDate: new Date("2026-03-06"),
            endDate: new Date("2026-06-13"),
          },
        ],
      },
    },
    include: {
      trimestres: true,
    },
  });

  console.log(`✅ Created school year: ${schoolYear2025.name}`);
  console.log(`   Trimestres: ${schoolYear2025.trimestres.length}`);

  console.log("🎉 School years seeding completed!");
}

export { seedSchoolYears };
