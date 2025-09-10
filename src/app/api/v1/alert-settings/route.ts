// src/app/api/alert-settings/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SECCIONES_ACADEMICAS } from "@/lib/constantes";
import type { AlertSettings } from "@/types/dashboard"; // Import the type

export async function GET() {
  try {
    const dbSettings = await prisma.alertSettings.findMany();

    if (dbSettings.length === 0) {
      // No settings found in the database
      return NextResponse.json({ configured: false });
    }

    // Transform the settings into the desired structure.
    const transformedSettings: AlertSettings = {
      // Initialize with defaults that will be overwritten
      primary: { threshold: 0 },
      secondary: { threshold: 0 },
      sections: {},
    };

    let generalThresholdsFound = false;
    dbSettings.forEach((setting) => {
      if (setting.seccion === "general_thresholds") {
        transformedSettings.primary.threshold = setting.primary_threshold;
        transformedSettings.secondary.threshold = setting.secondary_threshold;
        generalThresholdsFound = true;
      } else if (
        SECCIONES_ACADEMICAS[
          setting.seccion as keyof typeof SECCIONES_ACADEMICAS
        ]
      ) {
        // Only add valid sections defined in constants
        transformedSettings.sections[setting.seccion] = {
          primary: setting.primary_threshold,
          secondary: setting.secondary_threshold,
        };
      }
    });

    // Check if general thresholds were actually found
    if (!generalThresholdsFound) {
      console.warn(
        "Database alert settings exist but 'general_thresholds' entry is missing."
      );
      // Decide how to handle this: return configured: false, or error, or proceed with defaults (undesirable per requirement)
      // Let's return as not fully configured if general thresholds are missing
      return NextResponse.json({
        configured: false,
        error: "Configuración general incompleta en la base de datos.",
      });
    }

    // Ensure all sections from SECCIONES_ACADEMICAS have an entry in the output,
    // using the fetched general thresholds as defaults if a specific section entry is missing
    // THIS PART IS IMPORTANT: if a section is *missing* from DB, it uses the *fetched* general ones.
    for (const sectionKey in SECCIONES_ACADEMICAS) {
      const sectionName =
        SECCIONES_ACADEMICAS[sectionKey as keyof typeof SECCIONES_ACADEMICAS];
      if (!transformedSettings.sections[sectionName]) {
        transformedSettings.sections[sectionName] = {
          primary: transformedSettings.primary.threshold, // Use fetched general primary
          secondary: transformedSettings.secondary.threshold, // Use fetched general secondary
        };
      }
    }

    return NextResponse.json({
      configured: true,
      settings: transformedSettings,
    });
  } catch (error) {
    console.error("Error fetching alert settings:", error);
    return NextResponse.json(
      { configured: false, error: "Error fetching alert settings" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body: AlertSettings = await request.json(); // Expect the full AlertSettings structure
    const { primary, secondary, sections } = body;

    if (!sections || !primary?.threshold || !secondary?.threshold) {
      return NextResponse.json(
        { error: "Datos de configuración inválidos o incompletos" },
        { status: 400 }
      );
    }
    if (secondary.threshold <= primary.threshold) {
      return NextResponse.json(
        {
          error:
            "El umbral secundario global debe ser mayor que el primario global",
        },
        { status: 400 }
      );
    }

    // Start transaction
    const transactionPromises = [];

    // Upsert general thresholds
    transactionPromises.push(
      prisma.alertSettings.upsert({
        where: { seccion: "general_thresholds" },
        update: {
          primary_threshold: primary.threshold,
          secondary_threshold: secondary.threshold,
        },
        create: {
          seccion: "general_thresholds",
          primary_threshold: primary.threshold,
          secondary_threshold: secondary.threshold,
        },
      })
    );

    // Update or create section-specific settings
    for (const section in sections) {
      // Validate section thresholds before adding to transaction
      if (sections[section].secondary <= sections[section].primary) {
        return NextResponse.json(
          {
            error: `En ${section}, el umbral secundario debe ser mayor que el primario.`,
          },
          { status: 400 }
        );
      }
      if (
        Object.prototype.hasOwnProperty.call(sections, section) &&
        SECCIONES_ACADEMICAS[section as keyof typeof SECCIONES_ACADEMICAS]
      ) {
        transactionPromises.push(
          prisma.alertSettings.upsert({
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
          })
        );
      } else {
        console.warn(
          `Skipping unknown or invalid section during POST: ${section}`
        );
      }
    }

    // Execute transaction
    await prisma.$transaction(transactionPromises);

    // Return the saved settings structure
    return NextResponse.json(body); // Return the input data as confirmation
  } catch (error) {
    console.error("Error updating alert settings:", error);
    // Check for specific Prisma transaction errors if needed
    return NextResponse.json(
      { error: "Error actualizando la configuración de alertas" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect(); // Disconnect prisma client
  }
}
