import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';
import { auditService } from '@/services/audit.service';

// PATCH: Desbloquear un usuario
export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    // Verificar autenticación y permisos
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Solo administradores pueden desbloquear usuarios
    if (currentUser.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No tienes permisos para desbloquear usuarios' },
        { status: 403 }
      );
    }

    // Verificar que el usuario existe
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        fullName: true,
        isBlocked: true,
        failedLoginAttempts: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Desbloquear el usuario y resetear intentos fallidos
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        isBlocked: false,
        failedLoginAttempts: 0,
      },
      select: {
        id: true,
        username: true,
        fullName: true,
        email: true,
        role: true,
        groupCode: true,
        isBlocked: true,
        failedLoginAttempts: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
        AreaPermissions: {
          include: {
            area: true,
          },
        },
      },
    });

    // Registrar la acción en el log de auditoría
    await auditService.logAction({
      action: 'USER_UNLOCK',
      userId: currentUser.id,
      username: currentUser.username,
      entityType: 'user',
      entityId: user.id,
      description: `Desbloqueó la cuenta del usuario ${user.fullName} (${user.username})`,
      metadata: {
        unlockedUser: {
          id: user.id,
          username: user.username,
          fullName: user.fullName,
          previousFailedAttempts: user.failedLoginAttempts,
        },
      },
      status: 'success',
    });

    return NextResponse.json({
      message: 'Usuario desbloqueado exitosamente',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error al desbloquear usuario:', error);
    return NextResponse.json(
      { error: 'Error al desbloquear usuario' },
      { status: 500 }
    );
  }
}
