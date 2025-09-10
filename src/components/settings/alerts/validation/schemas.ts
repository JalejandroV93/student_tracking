import { z } from "zod";

// Esquema simple que maneja números directamente
const thresholdSchema = z.number().min(1, "Mínimo 1").max(20, "Máximo 20");

export const sectionThresholdSchema = z
  .object({
    primary: thresholdSchema,
    secondary: thresholdSchema,
  })
  .refine((data) => data.secondary > data.primary, {
    message: "El umbral secundario debe ser mayor que el primario",
    path: ["secondary"],
  });

export const settingsSchema = z
  .object({
    primary: z.object({
      threshold: thresholdSchema,
    }),
    secondary: z.object({
      threshold: thresholdSchema,
    }),
    sections: z.record(z.string(), sectionThresholdSchema),
  })
  .refine((data) => data.secondary.threshold > data.primary.threshold, {
    message:
      "El umbral secundario global debe ser mayor que el primario global",
    path: ["secondary", "threshold"],
  });

export type SettingsFormData = z.infer<typeof settingsSchema>;
