// app/api/auth/v1/logout/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { getCurrentUser } from '@/lib/auth';
import { auditService } from '@/services/audit.service';

export async function POST(request: NextRequest) {
  try {
    // Get current user before deleting cookie
    const user = await getCurrentUser();

    // Delete auth cookie
    (await cookies()).delete('auth_token');

    // Log logout if user was authenticated
    if (user) {
      await auditService.logLogout(user.id, user.username, request);
    }

    return NextResponse.json({ message: "Sesión cerrada exitosamente" });
  } catch (error) {
    console.error('Error during logout:', error);
    // Still delete cookie even if logging fails
    (await cookies()).delete('auth_token');
    return NextResponse.json({ message: "Sesión cerrada exitosamente" });
  }
}

