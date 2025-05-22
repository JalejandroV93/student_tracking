// src/app/api/v1/users/[id]/area-permissions/route.ts
import { NextResponse } from "next/server";
import { PrismaClient, Role } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth"; // Adjusted path

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // 1. Authentication & Authorization
    const callingUser = await getCurrentUser();
    if (!callingUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (callingUser.role !== Role.ADMIN) {
      return NextResponse.json(
        { error: "Forbidden: Requires ADMIN role" },
        { status: 403 }
      );
    }

    // 2. Get Target User ID
    const targetUserId = params.id;
    if (!targetUserId) {
      return NextResponse.json(
        { error: "Target user ID is required" },
        { status: 400 }
      );
    }
    
    // Validate if target user exists (optional, but good practice)
    const targetUser = await prisma.user.findUnique({ where: { id: targetUserId } });
    if (!targetUser) {
        return NextResponse.json({ error: "Target user not found" }, { status: 404 });
    }


    // 3. Fetch All Areas
    const allAreas = await prisma.area.findMany();

    // 4. Fetch Target User's Existing AreaPermissions
    const userPermissions = await prisma.areaPermissions.findMany({
      where: { userId: targetUserId },
      include: { area: true }, // Though area here isn't strictly needed for the map key, it's often useful
    });

    const permissionsMap = new Map(
      userPermissions.map((p) => [
        p.areaId,
        { canView: p.canView, areaPermissionId: p.id },
      ])
    );

    // 5. Construct Response
    const responseData = allAreas.map((area) => {
      const permissionDetails = permissionsMap.get(area.id);
      return {
        areaId: area.id,
        areaCode: area.code,
        areaName: area.name,
        canView: permissionDetails?.canView || false,
        areaPermissionId: permissionDetails?.areaPermissionId || null,
      };
    });

    // 6. Return Data
    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Error fetching area permissions:", error);
    let errorMessage = "Error fetching area permissions";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // 1. Authentication & Authorization
    const callingUser = await getCurrentUser();
    if (!callingUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (callingUser.role !== Role.ADMIN) {
      return NextResponse.json(
        { error: "Forbidden: Requires ADMIN role" },
        { status: 403 }
      );
    }

    // 2. Get Target User ID
    const targetUserId = params.id;
    if (!targetUserId) {
      return NextResponse.json(
        { error: "Target user ID is required" },
        { status: 400 }
      );
    }

    // 3. Parse Request Body
    const body = await request.json();
    const { areaId, canView } = body;

    if (typeof areaId !== "number" || typeof canView !== "boolean") {
      return NextResponse.json(
        { error: "Invalid request body: areaId (number) and canView (boolean) are required." },
        { status: 400 }
      );
    }

    // 4. Check if Target User and Area Exist
    const targetUser = await prisma.user.findUnique({ where: { id: targetUserId } });
    if (!targetUser) {
      return NextResponse.json({ error: "Target user not found" }, { status: 404 });
    }

    const targetArea = await prisma.area.findUnique({ where: { id: areaId } });
    if (!targetArea) {
      return NextResponse.json({ error: "Area not found" }, { status: 404 });
    }
    
    // 5. Upsert Permission
    // Assuming @@unique([userId, areaId]) constraint exists on AreaPermissions model
    const upsertedPermission = await prisma.areaPermissions.upsert({
      where: {
        userId_areaId: { // This is the default composite key name Prisma generates
          userId: targetUserId,
          areaId: areaId,
        },
      },
      create: {
        userId: targetUserId,
        areaId: areaId,
        canView: canView,
      },
      update: {
        canView: canView,
      },
    });

    // 6. Return Data
    return NextResponse.json(upsertedPermission, { status: 200 }); // 200 for simplicity on upsert

  } catch (error) {
    console.error("Error setting area permission:", error);
    let errorMessage = "Error setting area permission";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    // Check for Prisma unique constraint violation if upsert is not based on a unique field
    // (though with @@unique([userId, areaId]) this specific error is less likely for the upsert itself)
    // if (error.code === 'P2002') {
    //   return NextResponse.json({ error: "Unique constraint violation." }, { status: 409 });
    // }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
