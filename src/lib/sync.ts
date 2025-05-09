import { prisma } from "./prisma";
import { supabase } from "./supabase";

/**
 * Sincroniza los datos de Supabase a la base de datos local
 */
export async function sincronizarDesdeSupabase() {
  console.log(
    `[${new Date().toISOString()}] Iniciando sincronización desde Supabase a BD local`
  );
  try {
    // 1. Sincronizar estudiantes
    await sincronizarEstudiantes();

    // 2. Sincronizar faltas
    await sincronizarFaltas();

    console.log(
      `[${new Date().toISOString()}] Sincronización completada exitosamente`
    );
  } catch (error) {
    console.error(
      `[${new Date().toISOString()}] Error durante la sincronización:`,
      error
    );
    throw error;
  }
}

async function sincronizarEstudiantes() {
  // Obtener última fecha de actualización
  const ultimaActualizacion = await obtenerUltimaActualizacion("estudiantes");
  console.log(
    `[${new Date().toISOString()}] Sincronizando estudiantes desde: ${
      ultimaActualizacion || "inicio"
    }`
  );

  // Obtener estudiantes actualizados desde Supabase
  const { data: estudiantes, error } = await supabase
    .from("estudiantes")
    .select("*")
    .gt("updated_at", ultimaActualizacion || "1970-01-01");

  if (error) {
    console.error(
      `[${new Date().toISOString()}] Error obteniendo estudiantes:`,
      error
    );
    throw error;
  }

  if (!estudiantes?.length) {
    console.log(
      `[${new Date().toISOString()}] No hay nuevos estudiantes para sincronizar`
    );
    return;
  }

  console.log(
    `[${new Date().toISOString()}] Sincronizando ${
      estudiantes.length
    } estudiantes`
  );

  // Sincronizar estudiantes en batch
  for (const estudiante of estudiantes) {
    await prisma.estudiantes.upsert({
      where: { id: estudiante.id },
      update: {
        codigo: estudiante.codigo,
        nombre: estudiante.nombre,
        grado: estudiante.grado,
        nivel: estudiante.nivel,
        updated_at: new Date(),
      },
      create: {
        id: estudiante.id,
        codigo: estudiante.codigo,
        nombre: estudiante.nombre,
        grado: estudiante.grado,
        nivel: estudiante.nivel,
        created_at: new Date(estudiante.created_at),
        updated_at: new Date(estudiante.updated_at),
      },
    });
  }

  // Actualizar fecha de última sincronización
  await actualizarUltimaActualizacion("estudiantes", new Date());
  console.log(
    `[${new Date().toISOString()}] Actualización de estudiantes completada`
  );
}

async function sincronizarFaltas() {
  // Obtener última fecha de actualización
  const ultimaActualizacion = await obtenerUltimaActualizacion("faltas");
  console.log(
    `[${new Date().toISOString()}] Sincronizando faltas desde: ${
      ultimaActualizacion || "inicio"
    }`
  );

  // Obtener faltas actualizadas desde Supabase
  const { data: faltas, error } = await supabase
    .from("faltas")
    .select("*")
    .gt("updated_at", ultimaActualizacion || "1970-01-01");

  if (error) {
    console.error(
      `[${new Date().toISOString()}] Error obteniendo faltas:`,
      error
    );
    throw error;
  }

  if (!faltas?.length) {
    console.log(
      `[${new Date().toISOString()}] No hay nuevas faltas para sincronizar`
    );
    return;
  }

  console.log(
    `[${new Date().toISOString()}] Sincronizando ${faltas.length} faltas`
  );

  for (const falta of faltas) {
    await prisma.faltas.upsert({
      where: { hash: falta.hash },
      update: {
        id_estudiante: falta.id_estudiante,
        codigo_estudiante: falta.codigo_estudiante,
        tipo_falta: falta.tipo_falta,
        numero_falta: falta.numero_falta,
        descripcion_falta: falta.descripcion_falta,
        detalle_falta: falta.detalle_falta,
        acciones_reparadoras: falta.acciones_reparadoras,
        autor: falta.autor,
        fecha: falta.fecha ? new Date(falta.fecha) : null,
        trimestre: falta.trimestre,
        nivel: falta.nivel,
        attended: falta.attended,
        attended_at: falta.attended_at ? new Date(falta.attended_at) : null,
        updated_at: new Date(),
      },
      create: {
        hash: falta.hash,
        id_estudiante: falta.id_estudiante,
        codigo_estudiante: falta.codigo_estudiante,
        tipo_falta: falta.tipo_falta,
        numero_falta: falta.numero_falta,
        descripcion_falta: falta.descripcion_falta,
        detalle_falta: falta.detalle_falta,
        acciones_reparadoras: falta.acciones_reparadoras,
        autor: falta.autor,
        fecha: falta.fecha ? new Date(falta.fecha) : null,
        trimestre: falta.trimestre,
        nivel: falta.nivel,
        attended: falta.attended,
        attended_at: falta.attended_at ? new Date(falta.attended_at) : null,
        created_at: new Date(falta.created_at),
        updated_at: new Date(falta.updated_at),
      },
    });
  }

  // Actualizar fecha de última sincronización
  await actualizarUltimaActualizacion("faltas", new Date());
  console.log(
    `[${new Date().toISOString()}] Actualización de faltas completada`
  );
}

// Crear un modelo para almacenar las fechas de última sincronización
async function obtenerUltimaActualizacion(
  tabla: string
): Promise<string | null> {
  const metadata = await prisma.syncMetadata.findUnique({
    where: {
      tabla,
    },
  });

  return metadata?.ultima_actualizacion?.toISOString() || null;
}

async function actualizarUltimaActualizacion(tabla: string, fecha: Date) {
  await prisma.syncMetadata.upsert({
    where: {
      tabla,
    },
    update: {
      ultima_actualizacion: fecha,
    },
    create: {
      tabla,
      ultima_actualizacion: fecha,
    },
  });
}
