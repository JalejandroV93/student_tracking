// src/app/api/alert-settings/route.ts 
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { SECCIONES_ACADEMICAS } from "@/lib/constantes";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const settings = await prisma.alertSettings.findMany();

    // Transform the settings into the desired structure.
    const transformedSettings: {
      primary: { threshold: number };
      secondary: { threshold: number };
      sections: Record<string, { primary: number; secondary: number }>;
    } = {
      primary: { threshold: 3 }, secondary: { threshold: 5 }, sections: {},
    };

    settings.forEach((setting) => {
      transformedSettings.sections[setting.seccion] = {
        primary: setting.primary_threshold,
        secondary: setting.secondary_threshold,
      };
    });

    // Ensure all sections from SECCIONES_ACADEMICAS are present
    for (const sectionKey in SECCIONES_ACADEMICAS) {
        const sectionName = SECCIONES_ACADEMICAS[sectionKey as keyof typeof SECCIONES_ACADEMICAS];
        if (!transformedSettings.sections[sectionName]) {
            transformedSettings.sections[sectionName] = { primary: 3, secondary: 5 }; // Defaults
        }
    }


    return NextResponse.json(transformedSettings);
  } catch (error) {
    console.error("Error fetching alert settings:", error);
    return NextResponse.json(
      { error: "Error fetching alert settings" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { primary, secondary, sections } = body; // Get directly from body


    if (!sections || !primary || !secondary ) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
     //Update general thresholds

     await prisma.alertSettings.upsert({
        where: { seccion: 'general_thresholds' }, // Use a unique identifier
        update: {
          primary_threshold: primary.threshold,
          secondary_threshold: secondary.threshold,
        },
        create: {
          seccion: 'general_thresholds', // Unique identifier
          primary_threshold: primary.threshold,
          secondary_threshold: secondary.threshold,
        },
      });

    // Update or create the setting
    for (const section in sections) {

        await prisma.alertSettings.upsert({
            where: { seccion: section },
            update: {
            primary_threshold: sections[section].primary,
            secondary_threshold: sections[section].secondary,

            },
            create: {
            seccion: section,
            primary_threshold: sections[section].primary,
            secondary_threshold: sections[section].secondary,
            },
        });

    }


    return NextResponse.json({ message: "Settings updated successfully" });
  } catch (error) {
    console.error("Error updating alert settings:", error);
    return NextResponse.json(
      { error: "Error updating alert settings" },
      { status: 500 }
    );
  }
}