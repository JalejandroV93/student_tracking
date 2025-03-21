import { AlertStatus } from "@/lib/utils";
import type {
  Estudiantes,
  Faltas,
  Seguimientos,
  AlertSettings as PrismaAlertSettings,
} from "@prisma/client";

export type PrismaStudent = Estudiantes;
export type PrismaInfraction = Faltas;
export type PrismaFollowUp = Seguimientos;
export type PrismaAlertSetting = PrismaAlertSettings;

export interface Student {
  id: string;
  name: string;
  grado: string;
  level: string;
}

export interface Infraction {
  id: string;
  studentId: string;
  type: "Tipo I" | "Tipo II" | "Tipo III";
  number: string;
  date: string;
  description: string;
  details: string;
  author: string;
  remedialActions: string;
  trimester: string;
  level: string;
}

export interface FollowUp {
  id: string;
  infractionId: string;
  followUpNumber: number;
  date: string;
  type: string;
  details: string;
  author: string;
}

export interface AlertSettings {
  primary: { threshold: number };
  secondary: { threshold: number };
  sections: Record<string, { primary: number; secondary: number }>;
}

export interface DashboardState {
  students: Student[];
  infractions: Infraction[];
  followUps: FollowUp[];
  alertSettings: AlertSettings[];
  loading: boolean;
  error: string | null;
  typeICounts: number;
  typeIICounts: number;
  typeIIICounts: number;

  fetchData: () => Promise<void>;
  addFollowUp: (followUp: Omit<FollowUp, "id">) => Promise<void>;
  updateAlertSetting: (
    id: number,
    updatedSetting: Partial<AlertSettings>
  ) => Promise<void>;
  getStudentAlertStatus: (studentId: string) => AlertStatus | null;
}
