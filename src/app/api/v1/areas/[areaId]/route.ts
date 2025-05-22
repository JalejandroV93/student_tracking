// src/app/api/v1/areas/[areaId]/route.ts
import { NextResponse } from "next/server";
import { PrismaClient, Role } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth"; // Adjusted path

const prisma = new PrismaClient();

// PUT /api/v1/areas/:areaId (Update Area)
export async function PUT(
  request: Request,
  { params }: { params: { areaId: string } }
) {
  try {
    // 1. Admin Protection
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (currentUser.role !== Role.ADMIN) {
      return NextResponse.json(
        { error: "Forbidden: Requires ADMIN role" },
        { status: 403 }
      );
    }

    // 2. Parse areaId
    const areaId = parseInt(params.areaId, 10);
    if (isNaN(areaId)) {
      return NextResponse.json({ error: "Invalid Area ID format" }, { status: 400 });
    }

    // 3. Parse Request Body
    const body = await request.json();
    const { name, code } = body;

    if (!name && !code) {
      return NextResponse.json(
        { error: "Invalid input: 'name' or 'code' must be provided for update." },
        { status: 400 }
      );
    }

    const updateData: { name?: string; code?: string } = {};
    if (name !== undefined) {
      if (typeof name !== "string" || name.trim() === "") {
        return NextResponse.json(
          { error: "Invalid input: 'name' must be a non-empty string if provided." },
          { status: 400 }
        );
      }
      updateData.name = name;
    }
    if (code !== undefined) {
      if (typeof code !== "string" || code.trim() === "") {
        return NextResponse.json(
          { error: "Invalid input: 'code' must be a non-empty string if provided." },
          { status: 400 }
        );
      }
      updateData.code = code;
    }

    // 4. Check if Area Exists
    const existingArea = await prisma.area.findUnique({
      where: { id: areaId },
    });
    if (!existingArea) {
      return NextResponse.json({ error: "Area not found" }, { status: 404 });
    }

    // 5. If code is being updated, check for uniqueness
    if (updateData.code && updateData.code !== existingArea.code) {
      const areaWithNewCode = await prisma.area.findUnique({
        where: { code: updateData.code },
      });
      if (areaWithNewCode) {
        return NextResponse.json(
          { error: `An area with code '${updateData.code}' already exists.` },
          { status: 409 } // 409 Conflict
        );
      }
    }

    // 6. Update Area
    const updatedArea = await prisma.area.update({
      where: { id: areaId },
      data: updateData,
    });

    // 7. Return Updated Area
    return NextResponse.json(updatedArea, { status: 200 });
  } catch (error: any) {
    console.error("Error updating area:", error);
     if (error.code === 'P2025') { // Prisma's Record Not Found error for update
      return NextResponse.json({ error: "Area not found for update (P2025)" }, { status: 404 });
    }
    // Prisma specific error for unique constraint violation on 'code' during update
    if (error.code === 'P2002' && error.meta?.target?.includes('code')) {
        return NextResponse.json(
          { error: `An area with code '${(error.meta?.target as any)?.code || body.code}' already exists.` },
          { status: 409 }
        );
    }
    let errorMessage = "Error updating area";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// DELETE /api/v1/areas/:areaId (Delete Area)
export async function DELETE(
  request: Request,
  { params }: { params: { areaId: string } }
) {
  try {
    // 1. Admin Protection
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (currentUser.role !== Role.ADMIN) {
      return NextResponse.json(
        { error: "Forbidden: Requires ADMIN role" },
        { status: 403 }
      );
    }

    // 2. Parse areaId
    const areaId = parseInt(params.areaId, 10);
    if (isNaN(areaId)) {
      return NextResponse.json({ error: "Invalid Area ID format" }, { status: 400 });
    }

    // 3. Check if Area Exists (optional, delete will fail if not found)
    const existingArea = await prisma.area.findUnique({
      where: { id: areaId },
    });
    if (!existingArea) {
      return NextResponse.json({ error: "Area not found" }, { status: 404 });
    }

    // 4. Check for related AreaPermissions
    const relatedPermissionsCount = await prisma.areaPermissions.count({
      where: { areaId: areaId },
    });

    if (relatedPermissionsCount > 0) {
      return NextResponse.json(
        {
          error:
            "Cannot delete area as it's referenced in permissions. Please remove associated permissions first.",
        },
        { status: 409 } // 409 Conflict
      );
    }

    // 5. Delete Area
    await prisma.area.delete({
      where: { id: areaId },
    });

    // 6. Return No Content
    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    console.error("Error deleting area:", error);
    if (error.code === 'P2025') { // Prisma's Record Not Found error for delete
      return NextResponse.json({ error: "Area not found for deletion (P2025)" }, { status: 404 });
    }
    let errorMessage = "Error deleting area";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
