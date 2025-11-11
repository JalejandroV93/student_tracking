import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { hashPassword } from "@/lib/auth";
import z from "zod";
import { Role } from "@/lib/prisma/client";
import * as Papa from "papaparse";

// Esquema para validar cada fila del CSV con validaciones mejoradas
const csvUserSchema = z
  .object({
    username: z
      .string({ message: "Username es requerido" })
      .min(3, "Username debe tener al menos 3 caracteres")
      .max(50, "Username no puede tener más de 50 caracteres")
      .regex(
        /^[a-zA-Z0-9áéíóúñÑÁÉÍÓÚüÜ_.-]+$/,
        "Username solo puede contener letras (incluyendo tildes y ñ), números, puntos, guiones y guiones bajos"
      ),
    fullName: z
      .string({ message: "Nombre completo es requerido" })
      .min(2, "Nombre completo debe tener al menos 2 caracteres")
      .max(100, "Nombre completo no puede tener más de 100 caracteres")
      .transform((val) => val?.trim())
      .refine((val) => val && val.length > 0, {
        message: "Nombre completo no puede estar vacío",
      }),
    email: z
      .string()
      .email("Email inválido")
      .max(255, "Email no puede tener más de 255 caracteres")
      .optional()
      .or(z.literal(""))
      .or(z.undefined()),
    role: z
      .nativeEnum(Role, {
        message: `Rol inválido. Debe ser uno de: ${Object.values(Role).join(
          ", "
        )}`,
      })
      .refine((role) => role !== Role.ADMIN && !role.includes("COORDINATOR"), {
        message:
          "No se pueden crear usuarios ADMIN o COORDINADOR mediante importación masiva. Estos roles deben crearse manualmente.",
      }),
    password: z
      .string()
      .min(6, "La contraseña debe tener al menos 6 caracteres")
      .optional()
      .or(z.literal(""))
      .or(z.undefined()),
    id_phidias: z
      .string()
      .max(50, "ID Phidias no puede tener más de 50 caracteres")
      .optional()
      .or(z.literal(""))
      .or(z.undefined()),
    url_photo: z
      .string()
      .url("URL de foto inválida")
      .max(500, "URL de foto no puede tener más de 500 caracteres")
      .optional()
      .or(z.literal(""))
      .or(z.undefined()),
  })
  .transform((data) => {
    // Convertir campos opcionales vacíos a undefined
    return {
      ...data,
      email: data.email === "" ? undefined : data.email,
      password: data.password === "" ? undefined : data.password,
      id_phidias: data.id_phidias === "" ? undefined : data.id_phidias,
      url_photo: data.url_photo === "" ? undefined : data.url_photo,
    };
  });

// Tipos derivados del schema de validación
type CSVUser = z.infer<typeof csvUserSchema>;

// Tipo para un usuario con contraseña generada
type UserWithPassword = CSVUser & {
  password: string;
  isPasswordGenerated: boolean;
};

// Tipo para las filas del CSV antes de validación
type CSVRawRow = Record<string, string | undefined>;

// Tipo para errores de validación
interface ValidationError {
  row: number;
  field: string;
  message: string;
}

// Tipo para usuarios creados exitosamente
interface CreatedUser {
  username: string;
  fullName: string;
  role: string;
  temporaryPassword?: string; // Solo para contraseñas generadas automáticamente
}

// Tipo para el resultado de la importación
interface ImportResult {
  success: boolean;
  totalRows: number;
  successCount: number;
  errorCount: number;
  errors: ValidationError[];
  createdUsers: CreatedUser[];
}

// Función para normalizar headers con soporte para caracteres especiales
function normalizeHeader(header: string): string {
  if (!header) return "";

  const original = header;
  let normalized = header
    .trim()
    .toLowerCase()
    // Remover BOM y caracteres especiales al inicio
    .replace(/^\uFEFF/, "")
    .replace(/\s+/g, "_");

  // Mapeo específico de headers conocidos
  const headerMap: Record<string, string> = {
    fullname: "fullName",
    full_name: "fullName",
    nombre_completo: "fullName",
    user_name: "username",
    id_phidias: "id_phidias",
    phidias_id: "id_phidias",
    url_photo: "url_photo",
    photo_url: "url_photo",
    foto: "url_photo",
    contraseña: "password",
    contrasena: "password",
    clave: "password",
  };

  // Aplicar mapeo si existe
  if (headerMap[normalized]) {
    normalized = headerMap[normalized];
  }

  // Log para debugging
  console.log(`Header normalizado: "${original}" -> "${normalized}"`);

  return normalized;
}

// Función para procesar CSV con tipos apropiados
function processCSV(csvText: string): CSVRawRow[] {
  // Remover BOM si existe
  const cleanedText = csvText.replace(/^\uFEFF/, "");

  const result = Papa.parse<Record<string, string>>(cleanedText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: normalizeHeader,
    transform: (value: string) => {
      // Limpiar valores, manteniendo cadenas vacías como undefined para optional fields
      if (value === null || value === undefined) return "";
      const trimmed = value.toString().trim();
      if (trimmed === "null" || trimmed === "undefined") return "";
      return trimmed;
    },
  });

  if (result.errors.length > 0) {
    const errorMessages = result.errors
      .map((error) => error.message)
      .join(", ");
    throw new Error(`Error al parsear CSV: ${errorMessages}`);
  }

  // Transformar los datos para convertir strings vacíos en undefined
  const transformedData: CSVRawRow[] = result.data.map((row) => {
    const transformedRow: CSVRawRow = {};
    for (const [key, value] of Object.entries(row)) {
      transformedRow[key] = value === "" ? undefined : value;
    }
    return transformedRow;
  });

  return transformedData;
}

// Función para generar contraseña aleatoria con tipo seguro
function generateRandomPassword(length: number = 10): string {
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let password = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset.charAt(randomIndex);
  }
  return password;
}

// Función de tipo guardia para validar archivos
function isCSVFile(file: File): boolean {
  return file.name.endsWith(".csv") && file.type === "text/csv";
}

// Tipo para la respuesta de error estándar
interface ErrorResponse {
  error: string;
}

// Función para manejar errores de base de datos con tipo seguro
function handleDatabaseError(
  error: unknown,
  username: string
): ValidationError {
  if (error instanceof Error) {
    // Errores específicos de Prisma
    if ("code" in error) {
      const prismaError = error as { code: string; message: string };
      switch (prismaError.code) {
        case "P2002":
          return {
            row: 0,
            field: "username",
            message: `Username ya existe: ${username}`,
          };
        case "P2003":
          return {
            row: 0,
            field: "database",
            message: `Violación de clave foránea para usuario: ${username}`,
          };
        default:
          return {
            row: 0,
            field: "database",
            message: `Error de base de datos para usuario ${username}: ${prismaError.message}`,
          };
      }
    }

    return {
      row: 0,
      field: "database",
      message: `Error al crear usuario ${username}: ${error.message}`,
    };
  }

  return {
    row: 0,
    field: "database",
    message: `Error desconocido al crear usuario: ${username}`,
  };
}

// POST: Importar usuarios desde CSV
export async function POST(request: Request) {
  try {
    // Verificar autenticación y permisos
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json<ErrorResponse>(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    // Solo administradores pueden importar usuarios
    if (user.role !== "ADMIN") {
      return NextResponse.json<ErrorResponse>(
        { error: "No tienes permisos para importar usuarios" },
        { status: 403 }
      );
    }

    // Obtener el archivo del FormData
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json<ErrorResponse>(
        { error: "No se proporcionó ningún archivo válido" },
        { status: 400 }
      );
    }

    // Validar que el archivo sea CSV con tipo guardia
    if (!isCSVFile(file)) {
      return NextResponse.json<ErrorResponse>(
        { error: "El archivo debe ser de formato CSV" },
        { status: 400 }
      );
    }

    // Leer el archivo como texto
    const csvText = await file.text();

    // Procesar CSV
    let csvData: CSVRawRow[];
    try {
      csvData = processCSV(csvText);
    } catch (error) {
      return NextResponse.json<ErrorResponse>(
        {
          error: `Error al procesar el archivo CSV: ${
            error instanceof Error ? error.message : "Error desconocido"
          }`,
        },
        { status: 400 }
      );
    }

    if (csvData.length === 0) {
      return NextResponse.json<ErrorResponse>(
        { error: "El archivo CSV está vacío" },
        { status: 400 }
      );
    }

    // Validar y procesar cada fila
    const result: ImportResult = {
      success: true,
      totalRows: csvData.length,
      successCount: 0,
      errorCount: 0,
      errors: [],
      createdUsers: [],
    };

    const usersToCreate: UserWithPassword[] = [];
    const existingUsernames = new Set<string>();

    // Obtener usuarios existentes para evitar duplicados
    const existingUsers = await prisma.user.findMany({
      select: { username: true },
    });
    existingUsers.forEach((user) => existingUsernames.add(user.username));

    // Validar cada fila
    for (let i = 0; i < csvData.length; i++) {
      const row = csvData[i];
      const rowNumber = i + 2; // +2 porque empezamos desde la fila 2 (1 es header)

      // Log para debugging
      console.log(
        `Procesando fila ${rowNumber}:`,
        JSON.stringify(row, null, 2)
      );

      try {
        // Validar esquema
        const validatedUser = csvUserSchema.parse(row);

        // Verificar duplicados en el archivo
        const duplicateInFile = usersToCreate.some(
          (u) => u.username === validatedUser.username
        );
        if (duplicateInFile) {
          result.errors.push({
            row: rowNumber,
            field: "username",
            message: `Username duplicado en el archivo: ${validatedUser.username}`,
          });
          continue;
        }

        // Verificar si ya existe en la base de datos
        if (existingUsernames.has(validatedUser.username)) {
          result.errors.push({
            row: rowNumber,
            field: "username",
            message: `Username ya existe en la base de datos: ${validatedUser.username}`,
          });
          continue;
        }

        // Usar contraseña proporcionada o generar una aleatoria
        const userPassword =
          validatedUser.password && validatedUser.password.trim() !== ""
            ? validatedUser.password
            : generateRandomPassword();

        // Añadir a la lista de usuarios a crear
        usersToCreate.push({
          ...validatedUser,
          password: userPassword,
          isPasswordGenerated:
            !validatedUser.password || validatedUser.password.trim() === "",
        });
      } catch (error) {
        if (error instanceof z.ZodError) {
          error.issues.forEach((err) => {
            result.errors.push({
              row: rowNumber,
              field: err.path.join("."),
              message: err.message,
            });
          });
        } else {
          result.errors.push({
            row: rowNumber,
            field: "general",
            message: "Error desconocido en la fila",
          });
        }
      }
    }

    // Crear usuarios en la base de datos
    const createdUsers: CreatedUser[] = [];

    for (const userData of usersToCreate) {
      try {
        // Hash de la contraseña
        const hashedPassword = await hashPassword(userData.password);

        // Preparar datos para crear usuario con tipos específicos de Prisma
        const userCreateData = {
          username: userData.username,
          fullName: userData.fullName,
          email: userData.email || null,
          document: userData.username, // Usar username como documento por defecto
          role: userData.role,
          id_phidias: userData.id_phidias || null,
          url_photo: userData.url_photo || null,
          password: hashedPassword,
        } satisfies Parameters<typeof prisma.user.create>[0]["data"];

        // Crear usuario
        const newUser = await prisma.user.create({
          data: userCreateData,
          select: {
            username: true,
            fullName: true,
            role: true,
          },
        });

        createdUsers.push({
          username: newUser.username,
          fullName: newUser.fullName,
          role: newUser.role,
          ...(userData.isPasswordGenerated && {
            temporaryPassword: userData.password,
          }),
        });

        result.successCount++;
      } catch (error) {
        console.error("Error al crear usuario:", error);
        const dbError = handleDatabaseError(error, userData.username);
        result.errors.push(dbError);
      }
    }

    result.errorCount = result.errors.length;
    result.createdUsers = createdUsers;

    // Determinar si la importación fue completamente exitosa
    result.success = result.errorCount === 0;

    return NextResponse.json<ImportResult>(result);
  } catch (error) {
    console.error("Error en importación masiva:", error);
    return NextResponse.json<ErrorResponse>(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
