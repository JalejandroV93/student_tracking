// prisma/seed.ts
import { PrismaClient, Role } from "@prisma/client";
import { hashPassword } from "../src/lib/auth";

const prisma = new PrismaClient();

async function seed() {
  console.log("🌱 Iniciando siembra de datos...");

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
    const hashedPassword = await hashPassword("admin123");

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
