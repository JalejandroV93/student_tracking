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
    const { seccion, primary_threshold, secondary_threshold } = body;

    if (!seccion || primary_threshold === undefined || secondary_threshold === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Update or create the setting
    
      await prisma.alertSettings.upsert({
        where: { seccion: seccion },
        update: {
          primary_threshold: primary_threshold,
          secondary_threshold: secondary_threshold,
          
        },
        create: {
          seccion: seccion,
          primary_threshold: seccion[seccion].primary,
          secondary_threshold: seccion[seccion].secondary,
        },
      });
    

    return NextResponse.json({ message: "Settings updated successfully" });
  } catch (error) {
    console.error("Error updating alert settings:", error);
    return NextResponse.json(
      { error: "Error updating alert settings" },
      { status: 500 }
    );
  }
}
