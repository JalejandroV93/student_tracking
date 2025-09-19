// prisma/seed.ts
import { PrismaClient, Role } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();


const seguimientosConfig = [
  // Tipo I - Llamados de Atención Formal
  {
    phidias_id: 649,
    name: "Llamados de Atención Formal Preschool",
    description: "Formal Calls for Attention Preschool - Tipo I infractions",
    tipo_falta: "Tipo I",
    nivel_academico: "Preschool",
  },
  {
    phidias_id: 650,
    name: "Llamados de Atención Formal Primary School",
    description:
      "Formal Calls for Attention Primary School - Tipo I infractions",
    tipo_falta: "Tipo I",
    nivel_academico: "Elementary",
  },
  {
    phidias_id: 651,
    name: "Llamados de Atención Formal Middle School",
    description:
      "Formal Calls for Attention Middle School - Tipo I infractions",
    tipo_falta: "Tipo I",
    nivel_academico: "Middle School",
  },
  {
    phidias_id: 652,
    name: "Llamados de Atención Formal High School",
    description: "Formal Calls for Attention High School - Tipo I infractions",
    tipo_falta: "Tipo I",
    nivel_academico: "High School",
  },
  // Tipo II
  {
    phidias_id: 653,
    name: "Seguimiento Faltas Tipo 2 Preschool",
    description: "Seguimiento de faltas Tipo II para nivel Preschool",
    tipo_falta: "Tipo II",
    nivel_academico: "Preschool",
  },
  {
    phidias_id: 654,
    name: "Seguimiento Faltas Tipo 2 Primary School",
    description:
      "Seguimiento de faltas Tipo II para nivel Primary School/Elementary",
    tipo_falta: "Tipo II",
    nivel_academico: "Elementary",
  },
  {
    phidias_id: 655,
    name: "Seguimiento Faltas Tipo 2 Middle School",
    description: "Seguimiento de faltas Tipo II para nivel Middle School",
    tipo_falta: "Tipo II",
    nivel_academico: "Middle School",
  },
  {
    phidias_id: 656,
    name: "Seguimiento Faltas Tipo 2 High School",
    description: "Seguimiento de faltas Tipo II para nivel High School",
    tipo_falta: "Tipo II",
    nivel_academico: "High School",
  },
  // Tipo III
  {
    phidias_id: 657,
    name: "Seguimiento Faltas Tipo 3 Preschool",
    description: "Seguimiento de faltas Tipo III para nivel Preschool",
    tipo_falta: "Tipo III",
    nivel_academico: "Preschool",
  },
  {
    phidias_id: 658,
    name: "Seguimiento Faltas Tipo 3 Primary School",
    description:
      "Seguimiento de faltas Tipo III para nivel Primary School/Elementary",
    tipo_falta: "Tipo III",
    nivel_academico: "Elementary",
  },
  {
    phidias_id: 659,
    name: "Seguimiento Faltas Tipo 3 Middle School",
    description: "Seguimiento de faltas Tipo III para nivel Middle School",
    tipo_falta: "Tipo III",
    nivel_academico: "Middle School",
  },
  {
    phidias_id: 660,
    name: "Seguimiento Faltas Tipo 3 High School",
    description: "Seguimiento de faltas Tipo III para nivel High School",
    tipo_falta: "Tipo III",
    nivel_academico: "High School",
  },
];



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
      phidias_id: 21,
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


  

  console.log('🌱 Iniciando seed de configuraciones de seguimientos de Phidias...');
  
      // Obtener el año académico activo
      const activeSchoolYear = await prisma.schoolYear.findFirst({
        where: { isActive: true }
      });
  
      if (!activeSchoolYear) {
        console.error('❌ No se encontró un año académico activo. Creando uno de ejemplo...');
        
        // Crear un año académico de ejemplo si no existe
        const currentYear = new Date().getFullYear();
        const schoolYear = await prisma.schoolYear.create({
          data: {
            name: `${currentYear}-${currentYear + 1}`,
            phidias_id: 21, // ID de ejemplo basado en la respuesta de la API
            startDate: new Date(`${currentYear}-01-01`),
            endDate: new Date(`${currentYear}-12-31`),
            isActive: true,
            description: `Año académico ${currentYear}-${currentYear + 1} creado automáticamente`
          }
        });
  
        console.log(`✅ Año académico creado: ${schoolYear.name} (ID: ${schoolYear.id})`);
        
        // Usar el año académico recién creado
        await seedSeguimientos(schoolYear.id);
      } else {
        console.log(`📅 Usando año académico activo: ${activeSchoolYear.name} (ID: ${activeSchoolYear.id})`);
        await seedSeguimientos(activeSchoolYear.id);
      }
  
      console.log('✅ Seed de configuraciones de seguimientos completado exitosamente');
  
  
  console.log("✅ Siembra de datos completada");


}

async function seedSeguimientos(schoolYearId: number) {
  console.log(`📝 Creando ${seguimientosConfig.length} configuraciones de seguimientos...`);

  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const config of seguimientosConfig) {
    try {
      // Verificar si ya existe
      const existing = await prisma.phidiasSeguimiento.findFirst({
        where: {
          phidias_id: config.phidias_id,
          school_year_id: schoolYearId
        }
      });

      if (existing) {
        // Actualizar si es necesario
        const updatedSeguimiento = await prisma.phidiasSeguimiento.update({
          where: { id: existing.id },
          data: {
            name: config.name,
            description: config.description,
            tipo_falta: config.tipo_falta,
            nivel_academico: config.nivel_academico,
            isActive: true
          }
        });
        
        console.log(`🔄 Actualizado: ${updatedSeguimiento.name} (Phidias ID: ${config.phidias_id})`);
        updated++;
      } else {
        // Crear nuevo
        const newSeguimiento = await prisma.phidiasSeguimiento.create({
          data: {
            ...config,
            school_year_id: schoolYearId,
            isActive: true
          }
        });
        
        console.log(`✨ Creado: ${newSeguimiento.name} (Phidias ID: ${config.phidias_id})`);
        created++;
      }
    } catch (error) {
      console.error(`❌ Error procesando seguimiento ${config.name}:`, error);
      skipped++;
    }
  }

  console.log(`📊 Resumen: ${created} creados, ${updated} actualizados, ${skipped} omitidos`);

  // Mostrar resumen por tipo de falta
  const summary = await prisma.phidiasSeguimiento.groupBy({
    by: ['tipo_falta', 'nivel_academico'],
    where: {
      school_year_id: schoolYearId,
      isActive: true
    },
    _count: true
  });

  console.log('\n📈 Resumen por tipo de falta y nivel:');
  summary.forEach(item => {
    console.log(`   ${item.tipo_falta} - ${item.nivel_academico}: ${item._count} seguimientos`);
  });
}

seed()
  .catch((error) => {
    console.error("❌ Error en la siembra de datos:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
