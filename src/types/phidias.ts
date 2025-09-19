// Types para la integración con Phidias API

export interface PhidiasConsolidateRecord {
  poll_id: number;
  poll_name: string;
  person_id: number;
  person: string;
  section: string | null;
  timestamp: string;
  last_edit: string;
  author_id: number;
  author: string;
  last_editor_id: number;
  last_editor: string;
  "Fecha ": string;
  "Falta según Manual de Convivencia": string;
  "Descripción de la falta": string;
  "Acciones Reparadoras": string;
  "Estudiante con diagnóstico?": string;
}

export interface SeguimientoStatus {
  id: number;
  phidias_id: number;
  name: string;
  tipo_falta: string;
  nivel_academico: string;
  isActive: boolean;
  localCount: number;
  phidiasCount: number;
  status: 'synced' | 'out_of_sync' | 'error';
  error?: string;
  lastChecked: string;
}

export interface SeguimientosSummary {
  total: number;
  synced: number;
  outOfSync: number;
  errors: number;
  lastChecked: string;
}

export interface SeguimientosStatusResponse {
  seguimientos: SeguimientoStatus[];
  summary: SeguimientosSummary;
}

export type SyncStatus = 'synced' | 'out_of_sync' | 'error';
export type FaultType = 'Tipo I' | 'Tipo II' | 'Tipo III';
export type AcademicLevel = 'Preschool' | 'Elementary' | 'Middle School' | 'High School';