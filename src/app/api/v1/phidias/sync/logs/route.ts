import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { Role } from '@/prismacl/client';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user || user.role !== Role.ADMIN) {
      return NextResponse.json({ 
        error: 'No tienes permisos para acceder a esta funcionalidad' 
      }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    const logs = await prisma.phidiasSyncLog.findMany({
      orderBy: {
        startedAt: 'desc'
      },
      take: limit,
      skip: offset
    });

    return NextResponse.json(logs);

  } catch (error) {
    console.error('Error fetching sync logs:', error);
    return NextResponse.json({ 
      error: 'Error interno del servidor' 
    }, { status: 500 });
  }
}