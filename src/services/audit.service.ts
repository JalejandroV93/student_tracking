// src/services/audit.service.ts
import { prisma } from '@/lib/prisma';
import { Prisma } from '@/prismacl/client';
import { NextRequest } from 'next/server';

export type AuditAction =
  | 'login'
  | 'login_failed'
  | 'logout'
  | 'password_change'
  | 'password_change_failed'
  | 'create'
  | 'update'
  | 'delete'
  | 'sync_phidias_manual'
  | 'sync_phidias_auto'
  | 'sync_phidias_failed'
  | 'query'
  | 'export'
  | 'import'
  | 'user_blocked'
  | 'user_unblocked'
  | 'access_denied';

export type AuditEntityType =
  | 'falta'
  | 'estudiante'
  | 'caso'
  | 'seguimiento'
  | 'user'
  | 'phidias_sync'
  | 'phidias_config'
  | 'school_year'
  | 'grade'
  | 'alert_settings'
  | 'area_permissions';

export type AuditStatus = 'success' | 'error' | 'warning';

interface AuditLogData {
  action: AuditAction;
  userId?: string;
  username?: string;
  entityType?: AuditEntityType;
  entityId?: string | number;
  description: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  status?: AuditStatus;
  errorMessage?: string;
  duration?: number;
}

interface RequestContext {
  userId?: string;
  username?: string;
  ipAddress?: string;
  userAgent?: string;
}

class AuditService {
  /**
   * Extrae información del contexto de una request
   */
  private extractRequestContext(request?: NextRequest): Partial<RequestContext> {
    if (!request) return {};

    const ipAddress =
      request.headers.get('x-forwarded-for')?.split(',')[0] ||
      request.headers.get('x-real-ip') ||
      'unknown';

    const userAgent = request.headers.get('user-agent') || 'unknown';

    return { ipAddress, userAgent };
  }

  /**
   * Registra un evento en el log de auditoría
   */
  async log(data: AuditLogData): Promise<void> {
    try {
      await prisma.auditLog.create({
        data: {
          action: data.action,
          userId: data.userId,
          username: data.username,
          entityType: data.entityType,
          entityId: data.entityId?.toString(),
          description: data.description,
          metadata: data.metadata ? JSON.parse(JSON.stringify(data.metadata)) : undefined,
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
          status: data.status || 'success',
          errorMessage: data.errorMessage,
          duration: data.duration,
        },
      });
    } catch (error) {
      // Si falla el logging, no queremos que afecte la operación principal
      console.error('Error logging audit event:', error);
    }
  }

  /**
   * Registra un login exitoso
   */
  async logLogin(
    userId: string,
    username: string,
    request?: NextRequest
  ): Promise<void> {
    const context = this.extractRequestContext(request);

    await this.log({
      action: 'login',
      userId,
      username,
      description: `Usuario ${username} inició sesión`,
      ...context,
      status: 'success',
    });
  }

  /**
   * Registra un intento de login fallido
   */
  async logLoginFailed(
    username: string,
    reason: string,
    request?: NextRequest
  ): Promise<void> {
    const context = this.extractRequestContext(request);

    await this.log({
      action: 'login_failed',
      username,
      description: `Intento de login fallido para usuario ${username}`,
      errorMessage: reason,
      ...context,
      status: 'error',
    });
  }

  /**
   * Registra un logout
   */
  async logLogout(
    userId: string,
    username: string,
    request?: NextRequest
  ): Promise<void> {
    const context = this.extractRequestContext(request);

    await this.log({
      action: 'logout',
      userId,
      username,
      description: `Usuario ${username} cerró sesión`,
      ...context,
      status: 'success',
    });
  }

  /**
   * Registra un cambio de contraseña
   */
  async logPasswordChange(
    userId: string,
    username: string,
    request?: NextRequest
  ): Promise<void> {
    const context = this.extractRequestContext(request);

    await this.log({
      action: 'password_change',
      userId,
      username,
      entityType: 'user',
      entityId: userId,
      description: `Usuario ${username} cambió su contraseña`,
      ...context,
      status: 'success',
    });
  }

  /**
   * Registra una sincronización manual con Phidias
   */
  async logPhidiasSyncManual(
    userId: string,
    username: string,
    syncLogId: number,
    options?: { level?: string; studentId?: number },
    request?: NextRequest
  ): Promise<void> {
    const context = this.extractRequestContext(request);

    await this.log({
      action: 'sync_phidias_manual',
      userId,
      username,
      entityType: 'phidias_sync',
      entityId: syncLogId.toString(),
      description: `Usuario ${username} inició sincronización manual con Phidias`,
      metadata: options,
      ...context,
      status: 'success',
    });
  }

  /**
   * Registra una sincronización automática con Phidias
   */
  async logPhidiasSyncAuto(
    syncLogId: number,
    studentsProcessed: number,
    recordsCreated: number,
    recordsUpdated: number,
    duration: number
  ): Promise<void> {
    await this.log({
      action: 'sync_phidias_auto',
      entityType: 'phidias_sync',
      entityId: syncLogId.toString(),
      description: `Sincronización automática completada: ${studentsProcessed} estudiantes, ${recordsCreated} registros creados, ${recordsUpdated} actualizados`,
      metadata: {
        studentsProcessed,
        recordsCreated,
        recordsUpdated,
      },
      duration,
      status: 'success',
    });
  }

  /**
   * Registra una sincronización fallida con Phidias
   */
  async logPhidiasSyncFailed(
    syncLogId: number,
    error: string,
    isManual: boolean,
    userId?: string,
    username?: string
  ): Promise<void> {
    await this.log({
      action: 'sync_phidias_failed',
      userId,
      username,
      entityType: 'phidias_sync',
      entityId: syncLogId.toString(),
      description: `Sincronización ${isManual ? 'manual' : 'automática'} con Phidias falló`,
      errorMessage: error,
      status: 'error',
    });
  }

  /**
   * Registra la creación de una falta
   */
  async logFaltaCreated(
    hash: string,
    userId: string,
    username: string,
    studentId: number,
    tipoFalta: string,
    request?: NextRequest
  ): Promise<void> {
    const context = this.extractRequestContext(request);

    await this.log({
      action: 'create',
      userId,
      username,
      entityType: 'falta',
      entityId: hash,
      description: `Usuario ${username} creó una falta ${tipoFalta} para estudiante ${studentId}`,
      metadata: {
        studentId,
        tipoFalta,
      },
      ...context,
      status: 'success',
    });
  }

  /**
   * Registra la actualización de una falta
   */
  async logFaltaUpdated(
    hash: string,
    userId: string,
    username: string,
    changes: Record<string, unknown>,
    request?: NextRequest
  ): Promise<void> {
    const context = this.extractRequestContext(request);

    await this.log({
      action: 'update',
      userId,
      username,
      entityType: 'falta',
      entityId: hash,
      description: `Usuario ${username} actualizó falta ${hash}`,
      metadata: changes,
      ...context,
      status: 'success',
    });
  }

  /**
   * Registra la eliminación de una falta
   */
  async logFaltaDeleted(
    hash: string,
    userId: string,
    username: string,
    request?: NextRequest
  ): Promise<void> {
    const context = this.extractRequestContext(request);

    await this.log({
      action: 'delete',
      userId,
      username,
      entityType: 'falta',
      entityId: hash,
      description: `Usuario ${username} eliminó falta ${hash}`,
      ...context,
      status: 'success',
    });
  }

  /**
   * Registra la creación de un caso
   */
  async logCasoCreated(
    casoId: number,
    userId: string,
    username: string,
    faltaHash: string,
    request?: NextRequest
  ): Promise<void> {
    const context = this.extractRequestContext(request);

    await this.log({
      action: 'create',
      userId,
      username,
      entityType: 'caso',
      entityId: casoId.toString(),
      description: `Usuario ${username} creó caso ${casoId} para falta ${faltaHash}`,
      metadata: { faltaHash },
      ...context,
      status: 'success',
    });
  }

  /**
   * Registra la creación de un seguimiento
   */
  async logSeguimientoCreated(
    seguimientoId: number,
    casoId: number,
    userId: string,
    username: string,
    request?: NextRequest
  ): Promise<void> {
    const context = this.extractRequestContext(request);

    await this.log({
      action: 'create',
      userId,
      username,
      entityType: 'seguimiento',
      entityId: seguimientoId.toString(),
      description: `Usuario ${username} creó seguimiento para caso ${casoId}`,
      metadata: { casoId },
      ...context,
      status: 'success',
    });
  }

  /**
   * Registra una consulta importante
   */
  async logQuery(
    userId: string,
    username: string,
    queryType: string,
    filters?: Record<string, unknown>,
    request?: NextRequest
  ): Promise<void> {
    const context = this.extractRequestContext(request);

    await this.log({
      action: 'query',
      userId,
      username,
      description: `Usuario ${username} realizó consulta: ${queryType}`,
      metadata: filters,
      ...context,
      status: 'success',
    });
  }

  /**
   * Registra una exportación de datos
   */
  async logExport(
    userId: string,
    username: string,
    exportType: string,
    recordCount: number,
    request?: NextRequest
  ): Promise<void> {
    const context = this.extractRequestContext(request);

    await this.log({
      action: 'export',
      userId,
      username,
      description: `Usuario ${username} exportó ${recordCount} registros de tipo ${exportType}`,
      metadata: { exportType, recordCount },
      ...context,
      status: 'success',
    });
  }

  /**
   * Registra una importación de datos
   */
  async logImport(
    userId: string,
    username: string,
    importType: string,
    recordsCreated: number,
    recordsUpdated: number,
    recordsFailed: number,
    request?: NextRequest
  ): Promise<void> {
    const context = this.extractRequestContext(request);

    const status: AuditStatus = recordsFailed > 0 ? 'warning' : 'success';

    await this.log({
      action: 'import',
      userId,
      username,
      description: `Usuario ${username} importó datos de tipo ${importType}`,
      metadata: {
        importType,
        recordsCreated,
        recordsUpdated,
        recordsFailed
      },
      ...context,
      status,
    });
  }

  /**
   * Registra el bloqueo de un usuario
   */
  async logUserBlocked(
    targetUserId: string,
    targetUsername: string,
    blockedByUserId: string,
    blockedByUsername: string,
    reason?: string,
    request?: NextRequest
  ): Promise<void> {
    const context = this.extractRequestContext(request);

    await this.log({
      action: 'user_blocked',
      userId: blockedByUserId,
      username: blockedByUsername,
      entityType: 'user',
      entityId: targetUserId,
      description: `Usuario ${blockedByUsername} bloqueó a usuario ${targetUsername}`,
      metadata: { reason },
      ...context,
      status: 'success',
    });
  }

  /**
   * Registra un acceso denegado
   */
  async logAccessDenied(
    userId: string,
    username: string,
    resource: string,
    reason: string,
    request?: NextRequest
  ): Promise<void> {
    const context = this.extractRequestContext(request);

    await this.log({
      action: 'access_denied',
      userId,
      username,
      description: `Acceso denegado a ${username} para recurso: ${resource}`,
      errorMessage: reason,
      metadata: { resource },
      ...context,
      status: 'warning',
    });
  }

  /**
   * Obtiene logs de auditoría con filtros
   */
  async getLogs(filters: {
    userId?: string;
    username?: string;
    action?: AuditAction;
    entityType?: AuditEntityType;
    status?: AuditStatus;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  }) {
    const {
      userId,
      username,
      action,
      entityType,
      status,
      startDate,
      endDate,
      limit = 50,
      offset = 0,
    } = filters;

    const where: Prisma.AuditLogWhereInput = {};

    if (userId) where.userId = userId;
    if (username) where.username = { contains: username, mode: 'insensitive' };
    if (action) where.action = action;
    if (entityType) where.entityType = entityType;
    if (status) where.status = status;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.auditLog.count({ where }),
    ]);

    return {
      logs,
      total,
      limit,
      offset,
      hasMore: total > offset + limit,
    };
  }

  /**
   * Registra una acción genérica en el log de auditoría
   * Método versátil para registrar acciones que no tienen un método específico
   */
  async logAction(data: {
    action: AuditAction | string;
    userId?: string;
    username?: string;
    entityType?: AuditEntityType;
    entityId?: string | number;
    description: string;
    metadata?: Record<string, unknown>;
    status?: AuditStatus;
    errorMessage?: string;
    request?: NextRequest;
  }): Promise<void> {
    const context = this.extractRequestContext(data.request);

    await this.log({
      action: data.action as AuditAction,
      userId: data.userId,
      username: data.username,
      entityType: data.entityType,
      entityId: data.entityId?.toString(),
      description: data.description,
      metadata: data.metadata,
      errorMessage: data.errorMessage,
      ...context,
      status: data.status || 'success',
    });
  }
  

  /**
   * Obtiene estadísticas de auditoría
   */
  async getStats(filters?: {
    startDate?: Date;
    endDate?: Date;
    userId?: string;
  }) {
    const where: Prisma.AuditLogWhereInput = {};

    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = filters.startDate;
      if (filters.endDate) where.createdAt.lte = filters.endDate;
    }
    if (filters?.userId) where.userId = filters.userId;

    const [
      totalLogs,
      loginCount,
      syncCount,
      failedActions,
      actionBreakdown,
      topUsers,
    ] = await Promise.all([
      // Total de logs
      prisma.auditLog.count({ where }),

      // Logins exitosos
      prisma.auditLog.count({
        where: { ...where, action: 'login' },
      }),

      // Sincronizaciones
      prisma.auditLog.count({
        where: {
          ...where,
          action: { in: ['sync_phidias_manual', 'sync_phidias_auto'] },
        },
      }),

      // Acciones fallidas
      prisma.auditLog.count({
        where: { ...where, status: 'error' },
      }),

      // Desglose por tipo de acción
      prisma.auditLog.groupBy({
        by: ['action'],
        where,
        _count: true,
        orderBy: { _count: { action: 'desc' } },
        take: 10,
      }),

      // Usuarios más activos
      prisma.auditLog.groupBy({
        by: ['username'],
        where: { ...where, username: { not: null } },
        _count: true,
        orderBy: { _count: { username: 'desc' } },
        take: 10,
      }),
    ]);

    return {
      totalLogs,
      loginCount,
      syncCount,
      failedActions,
      actionBreakdown: actionBreakdown.map((item) => ({
        action: item.action,
        count: item._count,
      })),
      topUsers: topUsers.map((item) => ({
        username: item.username,
        count: item._count,
      })),
    };
  }
}

// Instancia singleton del servicio
export const auditService = new AuditService();

export default AuditService;
