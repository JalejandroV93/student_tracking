// src/hooks/useDashboardData.ts
import { useEffect, useState, useMemo, useCallback } from "react";
import { useAlertsStore } from "@/stores/alerts.store";
import { useSettingsStore } from "@/stores/settings.store";
import { useAuth } from "@/components/providers/AuthProvider";
import { Role } from "@prisma/client";
// Assuming AreaPermission is imported from user types, if not, define locally
// import { AreaPermission } from "@/types/user"; 

// Define types locally or import them
// These should match the actual structure of your data from API
interface Student {
  id: string;
  name: string;
  nivel: string | null; // e.g., "Primaria", "Secundaria"
  grado: string | null;
  // other fields as necessary
}

interface Infraction {
  id: string; // Or hash
  studentId: string;
  type: string; // e.g., "Tipo I", "Tipo II", "Tipo III"
  nivel: string | null; // e.g., "Primaria" - important for scoping
  // other fields as necessary
}

interface Area { // From /api/v1/areas
  id: number;
  name: string; // e.g., "Primaria"
  code: string; // e.g., "PRIMARY"
}

export interface SectionStats {
  name: string; // e.g., "Primaria"
  code: string; // e.g., "PRIMARY" 
  studentCount: number;
  typeI: number;
  typeII: number;
  typeIII: number;
  totalInfractions: number;
  alertsCount: number;
}


export const useDashboardData = () => {
  const { user: currentUser, isLoading: authLoading } = useAuth();
  const {
    students: studentsWithAlerts, // Renamed to avoid conflict, this is from alerts store
    fetchAlertsData,
    getStudentsWithAlerts, // This is from alerts store
    loading: alertsLoading,
    error: alertsError,
  } = useAlertsStore();

  const {
    settings,
    fetchSettings,
    loading: settingsLoading,
    error: settingsError,
    areSettingsConfigured,
  } = useSettingsStore();

  const [allScopedStudents, setAllScopedStudents] = useState<Student[]>([]);
  const [allScopedInfractions, setAllScopedInfractions] = useState<Infraction[]>([]);
  const [allSystemAreas, setAllSystemAreas] = useState<Area[]>([]);
  
  const [dataLoading, setDataLoading] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!currentUser) return; // Don't fetch if no user

    setDataLoading(true);
    setDataError(null);
    try {
      const [studentsRes, infractionsRes, areasRes] = await Promise.all([
        fetch('/api/v1/students'),
        fetch('/api/v1/infractions'),
        (currentUser.role === Role.ADMIN || currentUser.role === Role.PSYCHOLOGY) 
          ? fetch('/api/v1/areas') 
          : Promise.resolve(null) // Don't fetch areas if not Admin/Psychology
      ]);

      if (!studentsRes.ok) throw new Error(`Failed to fetch students: ${studentsRes.statusText}`);
      if (!infractionsRes.ok) throw new Error(`Failed to fetch infractions: ${infractionsRes.statusText}`);
      if (areasRes && !areasRes.ok) throw new Error(`Failed to fetch areas: ${areasRes.statusText}`);
      
      const studentsData = await studentsRes.json();
      console.log('[useDashboardData] Fetched Students:', studentsData);
      const infractionsData = await infractionsRes.json();
      console.log('[useDashboardData] Fetched Infractions:', infractionsData);
      const areasData = areasRes ? await areasRes.json() : [];
      console.log('[useDashboardData] Fetched Areas (Admin/Psych):', areasData);

      setAllScopedStudents(studentsData);
      setAllScopedInfractions(infractionsData);
      if (areasRes) setAllSystemAreas(areasData);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred while fetching data.";
      setDataError(errorMessage);
      console.error("[useDashboardData] ERROR in fetchData:", errorMessage);
    } finally {
      setDataLoading(false);
    }
  }, [currentUser]);


  // Fetch core data on mount or when user changes
  useEffect(() => {
    if (areSettingsConfigured === null) {
      fetchSettings();
    }
    fetchAlertsData(); // This fetches alerts data, already scoped by server
    fetchData(); // Fetch students, infractions, areas
  }, [fetchAlertsData, fetchSettings, areSettingsConfigured, fetchData]);


  const sectionStatsList = useMemo((): SectionStats[] => {
    console.log('[useDashboardData] useMemo sectionStatsList: currentUser:', currentUser);
    console.log('[useDashboardData] useMemo sectionStatsList: authLoading:', authLoading, 'dataLoading:', dataLoading, 'dataError:', dataError);
    console.log('[useDashboardData] useMemo sectionStatsList: allScopedStudents:', allScopedStudents);
    console.log('[useDashboardData] useMemo sectionStatsList: allScopedInfractions:', allScopedInfractions);
    console.log('[useDashboardData] useMemo sectionStatsList: allSystemAreas (Admin/Psych):', allSystemAreas);

    if (!currentUser || (!authLoading && !dataLoading && dataError)) { // Also consider dataError
        return []; // Return empty if no user, or if initial data load failed
    }
    if (authLoading || dataLoading) { // If user or data is still loading, don't compute yet
        return [];
    }

    let areasToProcess: { name: string; code: string }[] = [];

    if (currentUser.role === Role.ADMIN || currentUser.role === Role.PSYCHOLOGY) {
      areasToProcess = allSystemAreas.map(area => ({ name: area.name, code: area.code }));
    } else if (currentUser.AreaPermissions) {
      areasToProcess = currentUser.AreaPermissions
        .filter(p => p.canView && p.area)
        .map(p => ({ name: p.area.name, code: p.area.code }));
    }
    
    areasToProcess.sort((a,b) => a.name.localeCompare(b.name));
    console.log('[useDashboardData] useMemo sectionStatsList: areasToProcess:', areasToProcess);


    const computedList = areasToProcess.map(area => {
      const studentsInArea = allScopedStudents.filter(s => s.nivel === area.name);
      const infractionsInArea = allScopedInfractions.filter(i => i.nivel === area.name);

      const typeICount = infractionsInArea.filter(i => i.type === "Tipo I").length;
      const typeIICount = infractionsInArea.filter(i => i.type === "Tipo II").length;
      const typeIIICount = infractionsInArea.filter(i => i.type === "Tipo III").length; // Assuming Type III exists
      
      const alertsForThisSection = getStudentsWithAlerts(area.code.toLowerCase()); 
      const alertsCount = alertsForThisSection.length;

      // Example: Log for the first area, or a specific area if easier
      if (areasToProcess.length > 0 && area.name === areasToProcess[0].name) { 
        console.log(`[useDashboardData] Processing area: ${area.name}`);
        console.log('[useDashboardData] studentsInArea for this area:', studentsInArea);
        console.log('[useDashboardData] infractionsInArea for this area:', infractionsInArea);
        console.log('[useDashboardData] alertsForThisSection for this area:', alertsForThisSection);
      }

      return {
        name: area.name,
        code: area.code,
        studentCount: studentsInArea.length,
        typeI: typeICount,
        typeII: typeIICount,
        typeIII: typeIIICount,
        totalInfractions: typeICount + typeIICount + typeIIICount,
        alertsCount: alertsCount,
      };
    });
    console.log('[useDashboardData] useMemo sectionStatsList: final computed list:', computedList);
    return computedList;
  }, [currentUser, allScopedStudents, allScopedInfractions, allSystemAreas, getStudentsWithAlerts, authLoading, dataLoading, dataError]);


  // Combined error handling
  if (alertsError || settingsError || dataError) {
    // This might be too aggressive if one part of the dashboard can function without another.
    // Consider how to handle partial errors more gracefully if needed.
    throw new Error(
      alertsError?.toString() ||
        settingsError?.toString() ||
        dataError?.toString() ||
        "An unknown error occurred in useDashboardData"
    );
  }

  // Función para obtener el estado de alerta de un estudiante (uses studentsWithAlerts from alerts store)
  const getStudentAlertStatus = (studentId: string) => {
    const studentWithPossibleAlert = studentsWithAlerts.find( // Use studentsWithAlerts from alerts store
      (s) => s.id === studentId
    );
    return studentWithPossibleAlert?.alertStatus ?? null;
  };

  return {
    students: studentsWithAlerts, // This is the list of students who HAVE alerts, from alerts store
    allScopedStudents, // All students visible to the user (for general listings, etc.)
    sectionStatsList,
    settings,
    isLoading: authLoading || alertsLoading || settingsLoading || dataLoading,
    areSettingsConfigured,
    getStudentsWithAlerts, // from alerts store, can be used with or without area code
    getStudentAlertStatus,
  };
};
