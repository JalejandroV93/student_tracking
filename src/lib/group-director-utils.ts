// Utility script to assign area permissions to GROUP_DIRECTOR users
// This can be used by administrators to configure which areas a GROUP_DIRECTOR can manage

import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

interface AssignAreaPermissionParams {
  userId: string;
  areaCodes: string[];
}

/**
 * Assigns area permissions to a GROUP_DIRECTOR user
 * @param userId - The user ID of the GROUP_DIRECTOR
 * @param areaCodes - Array of area codes to assign (e.g., ["MIDDLE", "HIGH"])
 */
export async function assignAreaPermissionsToGroupDirector({
  userId,
  areaCodes,
}: AssignAreaPermissionParams): Promise<void> {
  try {
    // Verify the user exists and is a GROUP_DIRECTOR
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, fullName: true },
    });

    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }

    if (user.role !== Role.GROUP_DIRECTOR) {
      throw new Error(`User ${user.fullName} is not a GROUP_DIRECTOR`);
    }

    // Get all areas that match the provided codes
    const areas = await prisma.area.findMany({
      where: {
        code: {
          in: areaCodes,
        },
      },
    });

    if (areas.length !== areaCodes.length) {
      const foundCodes = areas.map(area => area.code);
      const missingCodes = areaCodes.filter(code => !foundCodes.includes(code));
      throw new Error(`Areas not found for codes: ${missingCodes.join(", ")}`);
    }

    // Remove existing permissions for this user
    await prisma.areaPermissions.deleteMany({
      where: { userId },
    });

    // Create new permissions
    const permissionsData = areas.map(area => ({
      userId,
      areaId: area.id,
      canView: true,
    }));

    await prisma.areaPermissions.createMany({
      data: permissionsData,
    });

    console.log(
      `✅ Successfully assigned area permissions to ${user.fullName}:`,
      areaCodes
    );
  } catch (error) {
    console.error("❌ Error assigning area permissions:", error);
    throw error;
  }
}

/**
 * Gets all GROUP_DIRECTOR users and their current area permissions
 */
export async function getGroupDirectorPermissions() {
  try {
    const groupDirectors = await prisma.user.findMany({
      where: { role: Role.GROUP_DIRECTOR },
      select: {
        id: true,
        username: true,
        fullName: true,
        AreaPermissions: {
          where: { canView: true },
          include: { area: true },
        },
      },
    });

    return groupDirectors.map(director => ({
      id: director.id,
      username: director.username,
      fullName: director.fullName,
      assignedAreas: director.AreaPermissions.map(permission => ({
        id: permission.area.id,
        name: permission.area.name,
        code: permission.area.code,
      })),
    }));
  } catch (error) {
    console.error("❌ Error getting GROUP_DIRECTOR permissions:", error);
    throw error;
  }
}

/**
 * Example usage function - can be called from admin interface
 */
export async function exampleUsage() {
  try {
    console.log("📋 Current GROUP_DIRECTOR permissions:");
    const permissions = await getGroupDirectorPermissions();
    console.log(JSON.stringify(permissions, null, 2));

    // Example: Assign a GROUP_DIRECTOR to manage Middle and High school
    // await assignAreaPermissionsToGroupDirector({
    //   userId: "user-id-here",
    //   areaCodes: ["MIDDLE", "HIGH"]
    // });
  } catch (error) {
    console.error("Error in example usage:", error);
  }
}