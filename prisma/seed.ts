// prisma/seed.ts
import { PrismaClient, Role } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function seed() {
  console.log("🌱 Iniciando siembra de datos...");

  // Insertar SchoolYear "quemado"
  const schoolYears = [
    {
      id: 1,
      name: "2025-2026",
      startDate: new Date("2025-07-01"),
      endDate: new Date("2026-06-30"),
      isActive: true,
      description: "Año Escolar 2025-2026",
      createdAt: new Date("2025-08-28T20:35:37.113Z"),
      updatedAt: new Date("2025-08-29T19:29:47.515Z"),
    },
  ];
  for (const sy of schoolYears) {
    const exists = await prisma.schoolYear.findUnique({ where: { id: sy.id } });
    if (!exists) {
      await prisma.schoolYear.create({ data: sy });
      console.log(`✅ SchoolYear creado: ${sy.name}`);
    } else {
      console.log(`⏩ SchoolYear ya existe: ${sy.name}`);
    }
  }

  // Insertar Trimestres "quemados"
  const trimestres = [
    {
      id: 1,
      schoolYearId: 1,
      name: "Primer Trimestre",
      order: 1,
      startDate: new Date("2025-08-11"),
      endDate: new Date("2025-11-12"),
      createdAt: new Date("2025-08-28T20:35:37.113Z"),
      updatedAt: new Date("2025-08-28T20:35:37.113Z"),
    },
    {
      id: 2,
      schoolYearId: 1,
      name: "Segundo Trimestre",
      order: 2,
      startDate: new Date("2025-11-13"),
      endDate: new Date("2026-03-06"),
      createdAt: new Date("2025-08-28T20:35:37.113Z"),
      updatedAt: new Date("2025-08-28T20:35:37.113Z"),
    },
    {
      id: 3,
      schoolYearId: 1,
      name: "Tercer Trimestre",
      order: 3,
      startDate: new Date("2026-03-07"),
      endDate: new Date("2026-06-12"),
      createdAt: new Date("2025-08-28T20:35:37.113Z"),
      updatedAt: new Date("2025-08-28T20:35:37.113Z"),
    },
  ];
  for (const t of trimestres) {
    const exists = await prisma.trimestre.findUnique({ where: { id: t.id } });
    if (!exists) {
      await prisma.trimestre.create({ data: t });
      console.log(`✅ Trimestre creado: ${t.name} (${t.schoolYearId})`);
    } else {
      console.log(`⏩ Trimestre ya existe: ${t.name} (${t.schoolYearId})`);
    }
  }

  // Crear las áreas por defecto
  const areas = [
    { name: "Preescolar", code: "PRESCHOOL" },
    { name: "Primaria", code: "ELEMENTARY" },
    { name: "Secundaria", code: "MIDDLE" },
    { name: "Bachillerato", code: "HIGH" },
  ];

  console.log("Creando áreas...");
  for (const area of areas) {
    const existingArea = await prisma.$queryRaw`
      SELECT * FROM "Area" WHERE code = ${area.code}
    `;

    if (!Array.isArray(existingArea) || existingArea.length === 0) {
      await prisma.$executeRaw`
        INSERT INTO "Area" (name, code, "createdAt") 
        VALUES (${area.name}, ${area.code}, NOW())
      `;
      console.log(`✅ Área creada: ${area.name}`);
    } else {
      console.log(`⏩ Área ya existe: ${area.name}`);
    }
  }

  // Crear usuario administrador por defecto si no existe
  const adminUsername = "admin";
  const existingAdmin = await prisma.user.findUnique({
    where: { username: adminUsername },
  });

  if (!existingAdmin) {
    console.log("Creando usuario administrador...");
    const hashedPassword = await bcrypt.hash("admin123", 10);

    await prisma.user.create({
      data: {
        username: adminUsername,
        fullName: "Administrador",
        document: adminUsername,
        email: "admin@example.com",
        role: Role.ADMIN,
        password: hashedPassword,
      },
    });

    console.log("✅ Usuario administrador creado");
  } else {
    console.log("⏩ Usuario administrador ya existe");
  }

  console.log("✅ Siembra de datos completada");
}

seed()
  .catch((error) => {
    console.error("❌ Error en la siembra de datos:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
