export interface ReportFilters {
  startDate?: string;
  endDate?: string;
  trimestre?: string;
  nivel?: string;
  tipoFalta?: string;
  schoolYearId?: string;
}

export interface ReportSummary {
  total: number;
  tipoI: number;
  tipoII: number;
  tipoIII: number;
}

export interface FaltasPorCategoria {
  name: string;
  tipoI: number;
  tipoII: number;
  tipoIII: number;
  total: number;
}

export interface FaltaRecurrente {
  grado?: string;
  nivel?: string;
  descripcion: string;
  cantidad: number;
}

export interface DocenteTopFaltas {
  autor: string;
  tipoI: number;
  tipoII: number;
  tipoIII: number;
  total: number;
}

export interface TendenciaMensual {
  mes: string;
  tipo_falta: string;
  cantidad: number;
}

export interface ReportData {
  summary: ReportSummary;
  faltasPorGrado: FaltasPorCategoria[];
  faltasPorNivel: FaltasPorCategoria[];
  faltasMasRecurrentes: {
    porGrado: FaltaRecurrente[];
    porNivel: FaltaRecurrente[];
  };
  docentesTopFaltas: DocenteTopFaltas[];
  tendenciaMensual: TendenciaMensual[];
  filters: ReportFilters;
}