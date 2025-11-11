import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';
import { hashPassword } from '@/lib/auth';
import z from 'zod';
import { Role } from '@/prismacl/client';

// Esquema de validación para crear/actualizar usuario
const userSchema = z.object({
  username: z.string().min(3),
  fullName: z.string().min(3),
  email: z.string().email().nullable().optional(),
  password: z.string().min(6).optional(),
  role: z.nativeEnum(Role),
  groupCode: z.string().optional(), // Código del grupo para directores de grupo
  id_phidias: z.string().optional(),
  url_photo: z.string().url().optional().or(z.literal("")),
  areaPermissions: z.array(
    z.object({
      areaId: z.number(),
      canView: z.boolean(),
    })
  ),
});

// GET: Obtener todos los usuarios con paginación y filtros
export async function GET(request: Request) {
  try {
    // Verificar autenticación y permisos
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Solo administradores pueden ver todos los usuarios
    if (user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No tienes permisos para ver todos los usuarios' },
        { status: 403 }
      );
    }

    // Obtener parámetros de query
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const blocked = searchParams.get('blocked') === 'true'; // Filtro para solo bloqueados

    const skip = (page - 1) * limit;

    // Construir filtros
    const where: Record<string, unknown> = {};

    // Filtro de búsqueda (por nombre, username o email)
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { username: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Filtro de usuarios bloqueados
    if (blocked) {
      where.isBlocked = true;
    }

    // Obtener total de usuarios con los filtros aplicados
    const totalUsers = await prisma.user.count({ where });

    // Obtener usuarios paginados con sus permisos de área
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        username: true,
        fullName: true,
        email: true,
        role: true,
        groupCode: true,
        id_phidias: true,
        url_photo: true,
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
      orderBy: { fullName: 'asc' },
      skip,
      take: limit,
    });

    // Calcular metadatos de paginación
    const totalPages = Math.ceil(totalUsers / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    return NextResponse.json({
      users,
      pagination: {
        total: totalUsers,
        page,
        limit,
        totalPages,
        hasNextPage,
        hasPreviousPage,
      },
    });
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    return NextResponse.json(
      { error: 'Error al obtener usuarios' },
      { status: 500 }
    );
  }
}

// POST: Crear un nuevo usuario
export async function POST(request: Request) {
  try {
    // Verificar autenticación y permisos
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Solo administradores pueden crear usuarios
    if (user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No tienes permisos para crear usuarios' },
        { status: 403 }
      );
    }

    const body = await request.json();
    
    // Validar datos
    const result = userSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: result.error.format() },
        { status: 400 }
      );
    }

    const { username, fullName, email, password, role, groupCode, id_phidias, url_photo, areaPermissions } = result.data;

    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Ya existe un usuario con ese nombre de usuario' },
        { status: 400 }
      );
    }

    // Verificar que se proporcionó una contraseña para usuarios nuevos
    if (!password) {
      return NextResponse.json(
        { error: 'Se requiere una contraseña para crear un usuario' },
        { status: 400 }
      );
    }

    // Hash de la contraseña
    const hashedPassword = await hashPassword(password);

    // Crear el usuario
    const newUser = await prisma.user.create({
      data: {
        username,
        fullName,
        email,
        document: username, // Usar username como documento por defecto
        role,
        groupCode: groupCode || null,
        id_phidias: id_phidias || null,
        url_photo: url_photo || null,
        password: hashedPassword,
      },
      select: {
        id: true,
        username: true,
        fullName: true,
        email: true,
        role: true,
      },
    });

    // Crear permisos de área si es necesario
    if (areaPermissions && areaPermissions.length > 0) {
      await prisma.areaPermissions.createMany({
        data: areaPermissions.map(permission => ({
          userId: newUser.id,
          areaId: permission.areaId,
          canView: permission.canView,
        })),
      });
    }

    // Obtener el usuario con sus permisos
    const userWithPermissions = await prisma.user.findUnique({
      where: { id: newUser.id },
      include: {
        AreaPermissions: {
          include: {
            area: true,
          },
        },
      },
    });

    return NextResponse.json(userWithPermissions, { status: 201 });
  } catch (error) {
    console.error('Error al crear usuario:', error);
    return NextResponse.json(
      { error: 'Error al crear usuario' },
      { status: 500 }
    );
  }
} 