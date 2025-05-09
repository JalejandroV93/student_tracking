import { AlertSettings } from "@/types/dashboard";
import { SECCIONES_ACADEMICAS } from "@/lib/constantes";
import { SettingsFormData } from "../validation/schemas";

export const getInitialFormValues = (
  settings: AlertSettings | null
): SettingsFormData => {
  const initialSectionValues = Object.values(SECCIONES_ACADEMICAS).reduce(
    (acc, sectionName) => {
      acc[sectionName] = {
        primary: settings?.sections[sectionName]?.primary ?? 3,
        secondary: settings?.sections[sectionName]?.secondary ?? 5,
      };
      return acc;
    },
    {} as Record<string, { primary: number; secondary: number }>
  );

  return {
    primary: { threshold: settings?.primary.threshold ?? 3 },
    secondary: { threshold: settings?.secondary.threshold ?? 5 },
    sections: initialSectionValues,
  };
};