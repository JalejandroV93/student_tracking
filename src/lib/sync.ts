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

    // 3. Sincronizar casos
    await sincronizarCasos();

    // 4. Sincronizar seguimientos
    await sincronizarSeguimientos();

    // 5. Sincronizar usuarios
    await sincronizarUsuarios();

    // 6. Sincronizar áreas
    await sincronizarAreas();

    // 7. Sincronizar permisos de áreas
    await sincronizarAreaPermissions();

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

async function sincronizarCasos() {
  // Obtener última fecha de actualización
  const ultimaActualizacion = await obtenerUltimaActualizacion("casos");
  console.log(
    `[${new Date().toISOString()}] Sincronizando casos desde: ${
      ultimaActualizacion || "inicio"
    }`
  );

  // Obtener casos actualizados desde Supabase
  const { data: casos, error } = await supabase
    .from("casos")
    .select("*")
    .gt("updated_at", ultimaActualizacion || "1970-01-01");

  if (error) {
    console.error(
      `[${new Date().toISOString()}] Error obteniendo casos:`,
      error
    );
    throw error;
  }

  if (!casos?.length) {
    console.log(
      `[${new Date().toISOString()}] No hay nuevos casos para sincronizar`
    );
    return;
  }

  console.log(
    `[${new Date().toISOString()}] Sincronizando ${casos.length} casos`
  );

  for (const caso of casos) {
    await prisma.casos.upsert({
      where: { id_caso: caso.id_caso },
      update: {
        hash_falta: caso.hash_falta,
        fecha_inicio: caso.fecha_inicio ? new Date(caso.fecha_inicio) : null,
        estado: caso.estado,
      },
      create: {
        id_caso: caso.id_caso,
        hash_falta: caso.hash_falta,
        fecha_inicio: caso.fecha_inicio ? new Date(caso.fecha_inicio) : null,
        estado: caso.estado || "Abierto",
      },
    });
  }

  // Actualizar fecha de última sincronización
  await actualizarUltimaActualizacion("casos", new Date());
  console.log(
    `[${new Date().toISOString()}] Actualización de casos completada`
  );
}

async function sincronizarSeguimientos() {
  // Obtener última fecha de actualización
  const ultimaActualizacion = await obtenerUltimaActualizacion("seguimientos");
  console.log(
    `[${new Date().toISOString()}] Sincronizando seguimientos desde: ${
      ultimaActualizacion || "inicio"
    }`
  );

  // Obtener seguimientos actualizados desde Supabase
  const { data: seguimientos, error } = await supabase
    .from("seguimientos")
    .select("*")
    .gt("updated_at", ultimaActualizacion || "1970-01-01");

  if (error) {
    console.error(
      `[${new Date().toISOString()}] Error obteniendo seguimientos:`,
      error
    );
    throw error;
  }

  if (!seguimientos?.length) {
    console.log(
      `[${new Date().toISOString()}] No hay nuevos seguimientos para sincronizar`
    );
    return;
  }

  console.log(
    `[${new Date().toISOString()}] Sincronizando ${
      seguimientos.length
    } seguimientos`
  );

  for (const seguimiento of seguimientos) {
    await prisma.seguimientos.upsert({
      where: { id_seguimiento: seguimiento.id_seguimiento },
      update: {
        id_caso: seguimiento.id_caso,
        tipo_seguimiento: seguimiento.tipo_seguimiento,
        fecha_seguimiento: seguimiento.fecha_seguimiento
          ? new Date(seguimiento.fecha_seguimiento)
          : null,
        detalles: seguimiento.detalles,
        autor: seguimiento.autor,
      },
      create: {
        id_seguimiento: seguimiento.id_seguimiento,
        id_caso: seguimiento.id_caso,
        tipo_seguimiento: seguimiento.tipo_seguimiento,
        fecha_seguimiento: seguimiento.fecha_seguimiento
          ? new Date(seguimiento.fecha_seguimiento)
          : null,
        detalles: seguimiento.detalles,
        autor: seguimiento.autor,
      },
    });
  }

  // Actualizar fecha de última sincronización
  await actualizarUltimaActualizacion("seguimientos", new Date());
  console.log(
    `[${new Date().toISOString()}] Actualización de seguimientos completada`
  );
}

async function sincronizarUsuarios() {
  // Obtener última fecha de actualización
  const ultimaActualizacion = await obtenerUltimaActualizacion("usuarios");
  console.log(
    `[${new Date().toISOString()}] Sincronizando usuarios desde: ${
      ultimaActualizacion || "inicio"
    }`
  );

  // Obtener usuarios actualizados desde Supabase
  const { data: usuarios, error } = await supabase
    .from("user")
    .select("*")
    .gt("updatedAt", ultimaActualizacion || "1970-01-01");

  if (error) {
    console.error(
      `[${new Date().toISOString()}] Error obteniendo usuarios:`,
      error
    );
    throw error;
  }

  if (!usuarios?.length) {
    console.log(
      `[${new Date().toISOString()}] No hay nuevos usuarios para sincronizar`
    );
    return;
  }

  console.log(
    `[${new Date().toISOString()}] Sincronizando ${usuarios.length} usuarios`
  );

  for (const usuario of usuarios) {
    await prisma.user.upsert({
      where: { id: usuario.id },
      update: {
        username: usuario.username,
        document: usuario.document,
        fullName: usuario.fullName,
        email: usuario.email,
        phonenumber: usuario.phonenumber,
        role: usuario.role,
        password: usuario.password,
        lastLogin: usuario.lastLogin ? new Date(usuario.lastLogin) : null,
        isBlocked: usuario.isBlocked,
        failedLoginAttempts: usuario.failedLoginAttempts,
        updatedAt: new Date(),
      },
      create: {
        id: usuario.id,
        username: usuario.username,
        document: usuario.document,
        fullName: usuario.fullName,
        email: usuario.email,
        phonenumber: usuario.phonenumber,
        role: usuario.role,
        password: usuario.password,
        lastLogin: usuario.lastLogin ? new Date(usuario.lastLogin) : null,
        isBlocked: usuario.isBlocked || false,
        failedLoginAttempts: usuario.failedLoginAttempts || 0,
        createdAt: new Date(usuario.createdAt),
        updatedAt: new Date(usuario.updatedAt),
      },
    });
  }

  // Actualizar fecha de última sincronización
  await actualizarUltimaActualizacion("usuarios", new Date());
  console.log(
    `[${new Date().toISOString()}] Actualización de usuarios completada`
  );
}

async function sincronizarAreas() {
  // Obtener última fecha de actualización
  const ultimaActualizacion = await obtenerUltimaActualizacion("areas");
  console.log(
    `[${new Date().toISOString()}] Sincronizando áreas desde: ${
      ultimaActualizacion || "inicio"
    }`
  );

  // Obtener áreas actualizadas desde Supabase
  const { data: areas, error } = await supabase
    .from("area")
    .select("*")
    .gt("updatedAt", ultimaActualizacion || "1970-01-01");

  if (error) {
    console.error(
      `[${new Date().toISOString()}] Error obteniendo áreas:`,
      error
    );
    throw error;
  }

  if (!areas?.length) {
    console.log(
      `[${new Date().toISOString()}] No hay nuevas áreas para sincronizar`
    );
    return;
  }

  console.log(
    `[${new Date().toISOString()}] Sincronizando ${areas.length} áreas`
  );

  for (const area of areas) {
    await prisma.area.upsert({
      where: { id: area.id },
      update: {
        name: area.name,
        code: area.code,
      },
      create: {
        id: area.id,
        name: area.name,
        code: area.code,
        createdAt: new Date(area.createdAt),
      },
    });
  }

  // Actualizar fecha de última sincronización
  await actualizarUltimaActualizacion("areas", new Date());
  console.log(
    `[${new Date().toISOString()}] Actualización de áreas completada`
  );
}

async function sincronizarAreaPermissions() {
  // Obtener última fecha de actualización
  const ultimaActualizacion = await obtenerUltimaActualizacion(
    "area_permissions"
  );
  console.log(
    `[${new Date().toISOString()}] Sincronizando permisos de área desde: ${
      ultimaActualizacion || "inicio"
    }`
  );

  // Obtener permisos de área actualizados desde Supabase
  const { data: permisos, error } = await supabase
    .from("areapermissions")
    .select("*")
    .gt("updatedAt", ultimaActualizacion || "1970-01-01");

  if (error) {
    console.error(
      `[${new Date().toISOString()}] Error obteniendo permisos de área:`,
      error
    );
    throw error;
  }

  if (!permisos?.length) {
    console.log(
      `[${new Date().toISOString()}] No hay nuevos permisos de área para sincronizar`
    );
    return;
  }

  console.log(
    `[${new Date().toISOString()}] Sincronizando ${
      permisos.length
    } permisos de área`
  );

  for (const permiso of permisos) {
    await prisma.areaPermissions.upsert({
      where: { id: permiso.id },
      update: {
        userId: permiso.userId,
        areaId: permiso.areaId,
        canView: permiso.canView,
        updatedAt: new Date(),
      },
      create: {
        id: permiso.id,
        userId: permiso.userId,
        areaId: permiso.areaId,
        canView: permiso.canView || false,
        createdAt: new Date(permiso.createdAt),
        updatedAt: new Date(permiso.updatedAt),
      },
    });
  }

  // Actualizar fecha de última sincronización
  await actualizarUltimaActualizacion("area_permissions", new Date());
  console.log(
    `[${new Date().toISOString()}] Actualización de permisos de área completada`
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
