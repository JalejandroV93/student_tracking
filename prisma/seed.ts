// prisma/seed.ts
import { Prisma, PrismaClient, Role } from "@prisma/client";

import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
    console.log(`Start seeding ...`);

    try {
        // // --- Admin User ---
        const adminPassword = "admin123"; // Esto debería cambiarse después del primer inicio de sesión
        const hashedPassword = await bcrypt.hash(adminPassword, 10);

        const existingAdmin = await prisma.user.findUnique({
            where: { username: "admin" },
        });

        if (existingAdmin) {
            console.warn("Admin user already exists. Skipping.");
        } else {
            const admin = await prisma.user.create({
                data: {
                    username: "admin",
                    document: "admin",
                    fullName: "Administrador del Sistema",
                    email: "admin@sistema.com",
                    role: Role.ADMIN,
                    password: hashedPassword,
                },
            });
            console.log(`Created admin user with id: ${admin.id}`);
        }

        console.log(`Seeding finished.`);
    } catch (e) {
        console.error(e);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
