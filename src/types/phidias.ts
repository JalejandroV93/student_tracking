// Types para la integración con Phidias API
export interface PhidiasGenericResult {
  success: boolean;
  data?: PhidiasPollResponse | PhidiasConsolidateRecord[];
  error?: string;
  rateLimited?: boolean;
  retryAfter?: number;
}

export interface PhidiasConsolidateResult {
  success: boolean;
  data?: PhidiasConsolidateRecord[];
  count?: number;
  error?: string;
  rateLimited?: boolean;
  retryAfter?: number;
}

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


export interface PhidiasItem {
  itemName: string;
  itemDescription: string;
  itemvalue: string | number;
}

export interface PhidiasRecord {
  id: number;
  person: number;
  personFirstname: string;
  personLastname: string;
  code: number;
  author: number;
  authorFirstname: string;
  authorLastname: string;
  last_editor: number;
  timestamp: number;
  last_edit: number;
  items: PhidiasItem[];
}

export interface PhidiasPollResponse {
  id: number;
  year: {
    id: number;
    name: string;
  };
  name: string;
  description: string;
  start_date: number;
  end_date: number | null;
  single_record: number;
  records: PhidiasRecord[];
}

export interface PhidiasSyncResult {
  success: boolean;
  data?: PhidiasPollResponse;
  error?: string;
  rateLimited?: boolean;
  retryAfter?: number;
}


export interface SyncProgress {
  phase: 'loading_config' | 'loading_students' | 'syncing' | 'completed' | 'error';
  processed: number;
  total: number;
  message: string;
  errors?: Array<{ studentId: number; error: string }>;
  currentLevel?: string;
  currentStudent?: { id: number; name?: string };
}

export interface SyncResult {
  success: boolean;
  logId: number;
  studentsProcessed: number;
  recordsCreated: number;
  recordsUpdated: number;
  errors: Array<{ studentId: number; pollId: number; error: string }>;
  duration: number;
}

export interface SyncOptions {
  triggeredBy?: string;
  specificLevel?: string; // Filtrar por nivel académico específico
  specificStudentId?: number; // Sincronizar solo un estudiante específico para debugging
  onProgress?: (progress: SyncProgress) => void;
}

export interface PhidiasSeguimientoConfig {
  id: number;
  phidias_id: number;
  name: string;
  tipo_falta: string;
  nivel_academico: string;
  isActive: boolean;
}




// Rate limiting configuration
export interface RateLimitConfig {
  maxRetries: number;
  baseDelayMs: number;
  maxDelayMs: number;
  backoffFactor: number;
}