// Setup script for GROUP_DIRECTOR users
// This script can be run after database seeding to create example GROUP_DIRECTOR users

import { PrismaClient, Role } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function setupGroupDirectors() {
  console.log("🎯 Setting up GROUP_DIRECTOR test users...\n");

  try {
    // Verify areas exist
    const areas = await prisma.area.findMany();
    console.log("📍 Available areas:");
    areas.forEach(area => {
      console.log(`   ${area.code}: ${area.name} (ID: ${area.id})`);
    });

    if (areas.length === 0) {
      console.log("❌ No areas found! Please run the seed script first.");
      return;
    }

    // Create GROUP_DIRECTOR users
    const groupDirectors = [
      {
        username: "director.middle.high",
        fullName: "Director Secundaria y Bachillerato",
        email: "director.sh@colegio.edu",
        document: "director.middle.high",
        areaCodes: ["MIDDLE", "HIGH"],
        description: "Director responsable de Secundaria (6-9) y Bachillerato (10-11)"
      },
      {
        username: "director.primary",
        fullName: "Director Educación Primaria",
        email: "director.primaria@colegio.edu", 
        document: "director.primary",
        areaCodes: ["PRESCHOOL", "ELEMENTARY"],
        description: "Director responsable de Preescolar y Primaria (PK-5)"
      },
      {
        username: "director.elem.middle",
        fullName: "Director Primaria y Secundaria",
        email: "director.ps@colegio.edu",
        document: "director.elem.middle", 
        areaCodes: ["ELEMENTARY", "MIDDLE"],
        description: "Director responsable de Primaria (1-5) y Secundaria (6-9)"
      }
    ];

    for (const directorData of groupDirectors) {
      console.log(`\n📝 Creating: ${directorData.fullName}`);

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { username: directorData.username }
      });

      if (existingUser) {
        console.log(`   ⏩ User ${directorData.username} already exists`);
        continue;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash("director123", 10);

      // Create user
      const newUser = await prisma.user.create({
        data: {
          username: directorData.username,
          fullName: directorData.fullName,
          email: directorData.email,
          document: directorData.document,
          role: Role.GROUP_DIRECTOR,
          password: hashedPassword,
        }
      });

      console.log(`   ✅ User created: ${newUser.username} (ID: ${newUser.id})`);

      // Get area IDs for the specified codes
      const userAreas = await prisma.area.findMany({
        where: {
          code: {
            in: directorData.areaCodes
          }
        }
      });

      // Create area permissions
      const permissionsData = userAreas.map(area => ({
        userId: newUser.id,
        areaId: area.id,
        canView: true,
      }));

      await prisma.areaPermissions.createMany({
        data: permissionsData
      });

      console.log(`   🔐 Area permissions assigned: ${directorData.areaCodes.join(", ")}`);
      console.log(`   📋 ${directorData.description}`);
    }

    // Display summary
    console.log("\n📊 Summary of GROUP_DIRECTOR users:");
    const allGroupDirectors = await prisma.user.findMany({
      where: { role: Role.GROUP_DIRECTOR },
      select: {
        id: true,
        username: true,
        fullName: true,
        AreaPermissions: {
          where: { canView: true },
          include: { area: true }
        }
      }
    });

    allGroupDirectors.forEach(director => {
      const areas = director.AreaPermissions.map(p => p.area.code).join(", ");
      console.log(`   👤 ${director.fullName} (${director.username})`);
      console.log(`      Areas: ${areas}`);
      console.log(`      Password: director123`);
    });

    console.log("\n🎉 GROUP_DIRECTOR setup complete!");
    console.log("\nNext steps:");
    console.log("1. Start the application: npm run dev");
    console.log("2. Login as admin (username: admin, password: admin123)");
    console.log("3. Go to Settings > Users to see the new GROUP_DIRECTOR users");
    console.log("4. Login as any GROUP_DIRECTOR to test alert filtering");
    console.log("5. Navigate to Alerts to verify filtering works correctly");

  } catch (error) {
    console.error("❌ Error setting up GROUP_DIRECTOR users:", error);
  } finally {
    await prisma.$disconnect();
  }
}

setupGroupDirectors();