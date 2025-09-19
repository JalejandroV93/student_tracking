// src/services/phidias-sync.service.ts
import { asignarNivelAcademico, extraerNumeroFalta } from '@/lib/academic-level-utils';
import { prisma } from '@/lib/prisma';
import { phidiasApiService } from '@/services/phidias-api.service';
import { PhidiasPollResponse, PhidiasRecord, PhidiasSeguimientoConfig, SyncOptions, SyncResult, SyncProgress } from '@/types/phidias';



class PhidiasSyncService {
  
  /**
   * Obtiene el trimestre correspondiente a una fecha específica
   */
  private async getTrimesterByDate(fecha: Date, schoolYearId: number): Promise<{ id: number; name: string } | null> {
    try {
      const trimestre = await prisma.trimestre.findFirst({
        where: {
          schoolYearId: schoolYearId,
          startDate: { lte: fecha },
          endDate: { gte: fecha }
        },
        select: {
          id: true,
          name: true
        }
      });
      
      return trimestre;
    } catch (error) {
      console.error('Error getting trimester for date:', fecha, error);
      return null;
    }
  }
  
  /**
   * Debug: Lista todas las configuraciones de seguimientos activas
   */
  async debugSeguimientosConfig(): Promise<void> {
    const activeSchoolYear = await prisma.schoolYear.findFirst({
      where: { isActive: true }
    });

    console.log('=== DEBUG: Active School Year ===');
    console.log(activeSchoolYear);

    const configs = await prisma.phidiasSeguimiento.findMany({
      where: {
        school_year_id: activeSchoolYear?.id,
        isActive: true
      }
    });

    console.log('\n=== DEBUG: Active Seguimientos Configs ===');
    configs.forEach(config => {
      console.log(`ID: ${config.id}, Poll: ${config.phidias_id}, Name: ${config.name}, Level: ${config.nivel_academico}, Type: ${config.tipo_falta}`);
    });
    
    // Verificar trimestres para el año académico actual
    const trimestres = await prisma.trimestre.findMany({
      where: { schoolYearId: activeSchoolYear?.id },
      select: {
        id: true,
        name: true,
        startDate: true,
        endDate: true,
        order: true
      },
      orderBy: { order: 'asc' }
    });
    
    console.log('\n=== DEBUG: Available Trimestres ===');
    trimestres.forEach(trimestre => {
      console.log(`ID: ${trimestre.id}, Name: ${trimestre.name}, Order: ${trimestre.order}, Range: ${trimestre.startDate.toISOString().split('T')[0]} to ${trimestre.endDate.toISOString().split('T')[0]}`);
    });
    
    // Verificar algunos estudiantes de ejemplo
    const sampleStudents = await prisma.estudiantes.findMany({
      where: { school_year_id: activeSchoolYear?.id },
      take: 10,
      select: {
        id: true,
        codigo: true,
        nombre: true,
        grado: true,
        seccion: true
      }
    });
    
    console.log('\n=== DEBUG: Sample Students ===');
    sampleStudents.forEach(student => {
      console.log(`ID: ${student.id}, Code: ${student.codigo}, Name: ${student.nombre}, Grade: ${student.grado}, Section: ${student.seccion}`);
    });
  }
  
  /**
   * Obtiene las configuraciones de seguimientos activas para el año académico actual
   */
  async getActiveSeguimientosConfig(): Promise<PhidiasSeguimientoConfig[]> {
    const activeSchoolYear = await prisma.schoolYear.findFirst({
      where: { isActive: true }
    });

    if (!activeSchoolYear) {
      throw new Error('No se encontró un año académico activo');
    }

    const configs = await prisma.phidiasSeguimiento.findMany({
      where: {
        school_year_id: activeSchoolYear.id,
        isActive: true
      },
      select: {
        id: true,
        phidias_id: true,
        name: true,
        tipo_falta: true,
        nivel_academico: true,
        isActive: true
      }
    });

    return configs;
  }

  /**
   * Filtra los estudiantes según el nivel académico del seguimiento para evitar consultas innecesarias
   */
  filterStudentsByLevel(
    students: Array<{ id: number; codigo: number; seccion: string | null; grado: string | null; nombre?: string | null; firstname?: string | null; lastname?: string | null }>,
    nivelRequerido: string
  ): Array<{ id: number; phidias_id: number }> {
    console.log(`\n=== FILTERING for level: ${nivelRequerido} ===`);
    console.log(`Total students to filter: ${students.length}`);
    
    const filtered = students
      .filter(student => {
        if (!student.seccion) {
          console.log(`Student ${student.id} has no section, skipping`);
          return false;
        }
        
        // Primero verificar si la sección ya es un nivel académico directo
        const seccionNormalizada = student.seccion.trim();
        
        // Mapear niveles académicos a nombres usados en Phidias
        const mapeoNiveles: Record<string, string[]> = {
          'Preschool': ['Preschool', 'Mi Taller'],
          'Elementary': ['Elementary', 'Primary School'],
          'Middle School': ['Middle School'],
          'High School': ['High School']
        };

        const nivelesValidos = mapeoNiveles[nivelRequerido] || [nivelRequerido];
        
        // Verificar coincidencia directa con el nivel
        let matches = nivelesValidos.includes(seccionNormalizada);
        
        if (!matches) {
          // Si no hay coincidencia directa, usar la función asignarNivelAcademico
          if (!student.grado) {
            console.log(`Student ${student.id} has no grade, skipping`);
            return false;
          }
          const nivelEstudiante = asignarNivelAcademico(student.grado);
          matches = nivelesValidos.includes(nivelEstudiante);
          console.log(`Student ${student.id}: grade="${student.grado}" -> calculated level="${nivelEstudiante}"`);
        } else {
          console.log(`Student ${student.id}: grado="${student.grado}" -> direct match with level`);
        }
        
        console.log(`  Required: ${nivelRequerido}, Valid levels: [${nivelesValidos.join(', ')}], Student section: ${seccionNormalizada}, Matches: ${matches}`);
        
        return matches;
      })
      .map(student => ({
        id: student.id,
        phidias_id: student.codigo // Usamos código como ID de Phidias
      }));
    
    console.log(`Filtered ${filtered.length} students for level ${nivelRequerido}`);
    return filtered;
  }

  /**
   * Mapea los datos de Phidias a nuestro modelo de faltas
   */
  private async mapPhidiasRecordToFalta(
    record: PhidiasRecord,
    studentData: { id: number; codigo: number; grado?: string; seccion?: string },
    schoolYearId: number,
    tipoFalta: string,
    nivelAcademico: string
  ) {
    console.log(`\n=== MAPPING PHIDIAS RECORD ===`);
    console.log(`Record ID: ${record.id}`);
    console.log(`Student: ${studentData.id} (codigo: ${studentData.codigo})`);
    console.log(`Record items:`, record.items);
    
    const items = record.items;
    
    // Extraer información de los items
    const fechaItem = items.find(item => 
      item.itemName.toLowerCase().includes('fecha') && 
      typeof item.itemvalue === 'number'
    );
    
    const faltaSegunManualItem = items.find(item =>
      item.itemName.toLowerCase().includes('falta según manual') ||
      item.itemName.toLowerCase().includes('falta segun manual')
    );
    
    const descripcionItem = items.find(item =>
      item.itemName.toLowerCase().includes('descripción') ||
      item.itemName.toLowerCase().includes('descripcion')
    );
    
    const accionesItem = items.find(item =>
      item.itemName.toLowerCase().includes('acciones reparadoras') ||
      item.itemName.toLowerCase().includes('accion')
    );

    const diagnosticoItem = items.find(item =>
      item.itemName.toLowerCase().includes('diagnóstico') ||
      item.itemName.toLowerCase().includes('diagnostico')
    );

    // Extraer datos
    const fecha = fechaItem ? new Date(Number(fechaItem.itemvalue) * 1000) : new Date();
    const faltaTexto = faltaSegunManualItem?.itemvalue?.toString() || '';
    const numeroFalta = extraerNumeroFalta(faltaTexto);
    const descripcion = descripcionItem?.itemvalue?.toString() || '';
    const acciones = accionesItem?.itemvalue?.toString() || '';
    const conDiagnostico = diagnosticoItem?.itemvalue?.toString()?.toLowerCase() === 'sí' ||
                          diagnosticoItem?.itemvalue?.toString()?.toLowerCase() === 'si';

    // Obtener trimestre basado en la fecha
    const trimesterInfo = await this.getTrimesterByDate(fecha, schoolYearId);

    // Usar el ID del record de Phidias como hash único (convertido a string para compatibilidad)
    const hash = `phidias_${record.id}`;

    // Construir el autor completo
    const autor = `${record.authorFirstname} ${record.authorLastname}`.trim();
    const ultimoEditor = `${record.authorFirstname} ${record.authorLastname}`.trim();

    const faltaData = {
      hash,
      id_estudiante: studentData.id,
      codigo_estudiante: studentData.codigo,
      tipo_falta: tipoFalta,
      numero_falta: numeroFalta,
      descripcion_falta: faltaTexto,
      detalle_falta: descripcion,
      acciones_reparadoras: acciones,
      autor,
      fecha,
      school_year_id: schoolYearId,
      id_externo: record.id,
      fecha_creacion: new Date(record.timestamp * 1000),
      fecha_ultima_edicion: new Date(record.last_edit * 1000),
      ultimo_editor: ultimoEditor,
      // Información adicional agregada
      trimestre: trimesterInfo?.name || null,
      trimestre_id: trimesterInfo?.id || null,
      nivel: nivelAcademico,
      seccion: studentData.grado || null,
      // Campos adicionales según el diagnóstico
      observaciones: conDiagnostico ? 'Estudiante con diagnóstico' : null,
      observaciones_autor: conDiagnostico ? autor : null,
      observaciones_fecha: conDiagnostico ? fecha : null,
    };

    console.log(`Mapped falta data:`, faltaData);
    console.log(`Trimester info:`, trimesterInfo);
    console.log(`Student grade/seccion:`, studentData.grado);
    console.log(`Academic level:`, nivelAcademico);
    console.log(`=== END MAPPING ===\n`);

    return faltaData;
  }

  /**
   * Procesa los registros de un seguimiento específico
   */
  private async processSeguimientoRecords(
    pollResponse: PhidiasPollResponse,
    studentData: { id: number; codigo: number; grado?: string; seccion?: string },
    schoolYearId: number,
    tipoFalta: string,
    nivelAcademico: string
  ): Promise<{ created: number; updated: number }> {
    let created = 0;
    let updated = 0;

    // Verificar si hay registros para procesar
    if (!pollResponse.records || pollResponse.records.length === 0) {
      console.log(`No records to process for student ${studentData.id}`);
      return { created, updated };
    }

    console.log(`Processing ${pollResponse.records.length} records for student ${studentData.id}`);

    for (const record of pollResponse.records) {
      try {
        const faltaData = await this.mapPhidiasRecordToFalta(record, studentData, schoolYearId, tipoFalta, nivelAcademico);

        // Verificar si la falta ya existe
        const existingFalta = await prisma.faltas.findUnique({
          where: { hash: faltaData.hash }
        });

        if (existingFalta) {
          // Actualizar si hay cambios
          const lastEditTime = new Date(record.last_edit * 1000);
          if (lastEditTime > existingFalta.fecha_ultima_edicion!) {
            try {
              console.log(`Updating existing falta ${faltaData.hash}`);
              await prisma.faltas.update({
                where: { hash: faltaData.hash },
                data: {
                  ...faltaData,
                  updated_at: new Date()
                }
              });
              updated++;
              console.log(`✅ Successfully updated record ${record.id} for student ${studentData.id}`);
            } catch (updateError) {
              console.error(`❌ Error updating record ${record.id} for student ${studentData.id}:`, updateError);
              throw updateError;
            }
          } else {
            console.log(`Record ${record.id} for student ${studentData.id} is up to date`);
          }
        } else {
          // Crear nueva falta
          try {
            console.log(`Creating new falta with data:`, faltaData);
            await prisma.faltas.create({
              data: faltaData
            });
            created++;
            console.log(`✅ Successfully created new record ${record.id} for student ${studentData.id}`);
          } catch (createError) {
            console.error(`❌ Error creating record ${record.id} for student ${studentData.id}:`, createError);
            throw createError; // Re-throw para que se capture en el catch principal
          }
        }
      } catch (error) {
        console.error(`Error processing record ${record.id} for student ${studentData.id}:`, error);
        // Continuar con el siguiente registro en caso de error
      }
    }

    console.log(`Completed processing for student ${studentData.id}: ${created} created, ${updated} updated`);
    return { created, updated };
  }

  /**
   * Realiza la sincronización completa
   */
  async syncWithPhidias(
    options: SyncOptions = {}
  ): Promise<SyncResult> {
    const { triggeredBy, specificLevel, specificStudentId, onProgress } = options;
    const startTime = Date.now();
    
    // Crear log de sincronización
    const syncLog = await prisma.phidiasSyncLog.create({
      data: {
        syncType: triggeredBy ? 'manual' : 'automatic',
        status: 'running',
        triggeredBy
      }
    });

    const errors: Array<{ studentId: number; pollId: number; error: string }> = [];
    let studentsProcessed = 0;
    let recordsCreated = 0;
    let recordsUpdated = 0;

    try {
      // Debug: Mostrar configuraciones activas
      await this.debugSeguimientosConfig();
      
      // Fase 1: Cargar configuraciones
      onProgress?.({
        phase: 'loading_config',
        processed: 0,
        total: 0,
        message: 'Cargando configuraciones de seguimientos...'
      });

      let seguimientosConfig = await this.getActiveSeguimientosConfig();
      
      // Filtrar por nivel específico si se especifica
      if (specificLevel) {
        seguimientosConfig = seguimientosConfig.filter(config => config.nivel_academico === specificLevel);
        console.log(`=== FILTERING by specific level: ${specificLevel} ===`);
        console.log(`Found ${seguimientosConfig.length} configs for level ${specificLevel}`);
      }
      
      if (seguimientosConfig.length === 0) {
        throw new Error(`No se encontraron configuraciones de seguimientos activas${specificLevel ? ` para el nivel ${specificLevel}` : ''}`);
      }

      // Fase 2: Cargar estudiantes
      onProgress?.({
        phase: 'loading_students',
        processed: 0,
        total: 0,
        message: 'Cargando estudiantes del año académico activo...'
      });

      const activeSchoolYear = await prisma.schoolYear.findFirst({
        where: { isActive: true }
      });

      if (!activeSchoolYear) {
        throw new Error('No se encontró un año académico activo');
      }

      const allStudents = await prisma.estudiantes.findMany({
        where: { 
          school_year_id: activeSchoolYear.id,
          ...(specificStudentId ? { id: specificStudentId } : {})
        },
        select: {
          id: true,
          codigo: true,
          seccion: true,
          grado: true,
          nombre: true,
          firstname: true,
          lastname: true
        }
      });

      if (specificStudentId) {
        console.log(`=== DEBUG: Filtering by specific student ID: ${specificStudentId} ===`);
        if (allStudents.length === 0) {
          throw new Error(`No se encontró el estudiante con ID ${specificStudentId}`);
        }
        console.log(`Found student:`, allStudents[0]);
      }

      console.log(`=== DEBUG: Found ${allStudents.length} students for school year ${activeSchoolYear.id} ===`);
      
      // Log algunos ejemplos de estudiantes
      const samplesStudents = allStudents.slice(0, 5);
      console.log('Sample students:', samplesStudents);
      
      // Contar estudiantes por sección
      const seccionCount: Record<string, number> = {};
      allStudents.forEach(student => {
        if (student.seccion) {
          seccionCount[student.seccion] = (seccionCount[student.seccion] || 0) + 1;
        } else {
          seccionCount['NULL_SECTION'] = (seccionCount['NULL_SECTION'] || 0) + 1;
        }
      });
      
      console.log('Students by section:', seccionCount);

      // Fase 3: Sincronización
      onProgress?.({
        phase: 'syncing',
        processed: 0,
        total: seguimientosConfig.length,
        message: 'Iniciando sincronización con Phidias...'
      });

      for (let i = 0; i < seguimientosConfig.length; i++) {
        const config = seguimientosConfig[i];
        
        try {
          // Filtrar estudiantes por nivel académico
          const studentsForLevel = this.filterStudentsByLevel(allStudents, config.nivel_academico);
          
          if (studentsForLevel.length === 0) {
            console.log(`No students found for level ${config.nivel_academico}, skipping poll ${config.phidias_id}`);
            continue;
          }

          console.log(`Processing ${studentsForLevel.length} students for ${config.name} (Poll ID: ${config.phidias_id})`);

          // Crear mapeo de studentId a datos completos del estudiante
          const studentMap = new Map<number, { id: number; codigo: number; grado?: string; seccion?: string }>();
          studentsForLevel.forEach(student => {
            const fullStudentData = allStudents.find(s => s.id === student.id);
            studentMap.set(student.id, { 
              id: student.id, 
              codigo: student.phidias_id,
              grado: fullStudentData?.grado || undefined,
              seccion: fullStudentData?.seccion || undefined
            });
          });

          // Procesar estudiantes en lotes pequeños para evitar rate limiting
          const batchSize = 5;
          for (let j = 0; j < studentsForLevel.length; j += batchSize) {
            const batch = studentsForLevel.slice(j, j + batchSize);
            
            const batchResults = await phidiasApiService.processBatchStudents(
              batch,
              [config.phidias_id],
              (processed, total) => {
                const currentStudent = batch[processed - 1];
                const studentData = currentStudent ? 
                  allStudents.find(s => s.id === currentStudent.id) : null;
                const studentName = studentData ? 
                  `${studentData.nombre || studentData.firstname || 'N/A'}` : 'N/A';
                
                onProgress?.({
                  phase: 'syncing',
                  processed: i + (processed / total),
                  total: seguimientosConfig.length,
                  message: `Sincronizando ${config.name}: ${processed}/${total} estudiantes procesados`,
                  currentLevel: config.nivel_academico,
                  currentStudent: currentStudent ? { id: currentStudent.id, name: studentName } : undefined
                });
              }
            );

            // Procesar resultados del lote inmediatamente
            for (const result of batchResults) {
              if (result.result.success && result.result.data) {
                const studentData = studentMap.get(result.studentId);
                if (!studentData) {
                  console.error(`No student data found for ID ${result.studentId}`);
                  continue;
                }

                // Verificar si hay registros en la respuesta
                if (result.result.data.records && result.result.data.records.length > 0) {
                  console.log(`\n=== PROCESSING RECORDS ===`);
                  console.log(`Student ID: ${result.studentId}, Poll ID: ${result.pollId}`);
                  console.log(`Records count: ${result.result.data.records.length}`);
                  console.log(`Student data:`, studentData);
                  console.log(`School year: ${activeSchoolYear.id}`);
                  console.log(`Tipo falta: ${config.tipo_falta}`);
                  
                  const { created, updated } = await this.processSeguimientoRecords(
                    result.result.data,
                    studentData,
                    activeSchoolYear.id,
                    config.tipo_falta,
                    config.nivel_academico
                  );
                  
                  recordsCreated += created;
                  recordsUpdated += updated;
                  console.log(`Student ${result.studentId}: ${created} created, ${updated} updated records`);
                  console.log(`=== END PROCESSING ===\n`);
                } else {
                  console.log(`No records found for student ${result.studentId} in poll ${result.pollId}`);
                }
                
                studentsProcessed++;
              } else if (!result.result.success) {
                errors.push({
                  studentId: result.studentId,
                  pollId: result.pollId,
                  error: result.result.error || 'Unknown error'
                });
                console.error(`Error for student ${result.studentId} in poll ${result.pollId}: ${result.result.error}`);
              }
            }
          }

        } catch (error) {
          console.error(`Error processing seguimiento ${config.name}:`, error);
          errors.push({
            studentId: 0,
            pollId: config.phidias_id,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }

        onProgress?.({
          phase: 'syncing',
          processed: i + 1,
          total: seguimientosConfig.length,
          message: `Completado: ${config.name}`,
          currentLevel: config.nivel_academico
        });
      }

      const duration = Math.round((Date.now() - startTime) / 1000);

      // Actualizar log con resultados exitosos
      await prisma.phidiasSyncLog.update({
        where: { id: syncLog.id },
        data: {
          status: errors.length === 0 ? 'success' : 'partial',
          studentsProcessed,
          recordsCreated,
          recordsUpdated,
          errors: errors.length > 0 ? JSON.parse(JSON.stringify(errors)) : undefined,
          completedAt: new Date(),
          duration
        }
      });

      onProgress?.({
        phase: 'completed',
        processed: seguimientosConfig.length,
        total: seguimientosConfig.length,
        message: `Sincronización completada. ${recordsCreated} registros creados, ${recordsUpdated} actualizados`
      });

      return {
        success: true,
        logId: syncLog.id,
        studentsProcessed,
        recordsCreated,
        recordsUpdated,
        errors,
        duration
      };

    } catch (error) {
      const duration = Math.round((Date.now() - startTime) / 1000);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      // Actualizar log con error
      await prisma.phidiasSyncLog.update({
        where: { id: syncLog.id },
        data: {
          status: 'error',
          studentsProcessed,
          recordsCreated,
          recordsUpdated,
          errors: JSON.parse(JSON.stringify([{ studentId: 0, pollId: 0, error: errorMessage }, ...errors])),
          completedAt: new Date(),
          duration
        }
      });

      onProgress?.({
        phase: 'error',
        processed: 0,
        total: 0,
        message: `Error en sincronización: ${errorMessage}`,
        errors: errors.map(e => ({ studentId: e.studentId, error: e.error }))
      });

      return {
        success: false,
        logId: syncLog.id,
        studentsProcessed,
        recordsCreated,
        recordsUpdated,
        errors: [{ studentId: 0, pollId: 0, error: errorMessage }, ...errors],
        duration
      };
    }
  }

  /**
   * Sincroniza un estudiante específico para debugging
   */
  async syncSpecificStudent(
    studentId: number,
    triggeredBy?: string,
    onProgress?: (progress: SyncProgress) => void
  ): Promise<SyncResult> {
    console.log(`=== DEBUG: Syncing specific student ${studentId} ===`);
    
    return this.syncWithPhidias({
      triggeredBy,
      specificStudentId: studentId,
      onProgress
    });
  }

  /**
   * Sincroniza un nivel académico específico
   */
  async syncSpecificLevel(
    level: string,
    triggeredBy?: string,
    onProgress?: (progress: SyncProgress) => void
  ): Promise<SyncResult> {
    console.log(`=== DEBUG: Syncing specific level ${level} ===`);
    
    return this.syncWithPhidias({
      triggeredBy,
      specificLevel: level,
      onProgress
    });
  }

  /**
   * Obtiene el historial de sincronizaciones
   */
  async getSyncHistory(limit = 10) {
    return prisma.phidiasSyncLog.findMany({
      orderBy: { startedAt: 'desc' },
      take: limit,
      select: {
        id: true,
        syncType: true,
        status: true,
        studentsProcessed: true,
        recordsCreated: true,
        recordsUpdated: true,
        startedAt: true,
        completedAt: true,
        duration: true,
        triggeredBy: true,
        errors: true
      }
    });
  }

  /**
   * Obtiene estadísticas de la última sincronización
   */
  async getLastSyncStats() {
    const lastSync = await prisma.phidiasSyncLog.findFirst({
      orderBy: { startedAt: 'desc' },
      select: {
        id: true,
        status: true,
        studentsProcessed: true,
        recordsCreated: true,
        recordsUpdated: true,
        startedAt: true,
        completedAt: true,
        duration: true,
        errors: true
      }
    });

    return lastSync;
  }
}

// Instancia singleton del servicio
export const phidiasSyncService = new PhidiasSyncService();

export default PhidiasSyncService;