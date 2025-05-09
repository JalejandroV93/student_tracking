import * as z from "zod";

export const sectionThresholdSchema = z
  .object({
    primary: z.coerce.number().min(1, "Mínimo 1").max(20, "Máximo 20"),
    secondary: z.coerce.number().min(1, "Mínimo 1").max(20, "Máximo 20"),
  })
  .refine((data) => data.secondary > data.primary, {
    message: "El umbral secundario debe ser mayor que el primario",
    path: ["secondary"],
  });

export const settingsSchema = z
  .object({
    primary: z.object({
      threshold: z.coerce.number().min(1, "Mínimo 1").max(20, "Máximo 20"),
    }),
    secondary: z.object({
      threshold: z.coerce.number().min(1, "Mínimo 1").max(20, "Máximo 20"),
    }),
    sections: z.record(z.string(), sectionThresholdSchema),
  })
  .refine((data) => data.secondary.threshold > data.primary.threshold, {
    message: "El umbral secundario global debe ser mayor que el primario global",
    path: ["secondary", "threshold"],
  });

export type SettingsFormData = z.infer<typeof settingsSchema>;