// src/app/dashboard/page.tsx
"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner"; // Use sonner directly
import { Overview } from "@/components/dashboard/Overview"; // Adjust path
import { Loader2 } from "lucide-react";
import { AlertSettings, Infraction, Student } from "@/types/dashboard";
import { AlertStatus, getStudentTypeICount } from "@/lib/utils";
import { getSectionCategory } from "@/lib/constantes";

// Fetch data directly or via a dedicated hook if it gets complex
async function fetchOverviewData(): Promise<{ students: Student[], infractions: Infraction[], settings: AlertSettings }> {
    const [studentsRes, infractionsRes, settingsRes] = await Promise.all([
        fetch("/api/students"),
        fetch("/api/infractions"),
        fetch("/api/alert-settings"),
    ]);

    if (!studentsRes.ok || !infractionsRes.ok || !settingsRes.ok) {
        // More specific error handling could be added here
        throw new Error("Failed to fetch overview data");
    }

    const [students, infractions, settings] = await Promise.all([
        studentsRes.json(),
        infractionsRes.json(),
        settingsRes.json(),
    ]);

    return { students, infractions, settings };
}


export default function DashboardOverviewPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [infractions, setInfractions] = useState<Infraction[]>([]);
  const [settings, setSettings] = useState<AlertSettings | null>(null);

  // Derived counts
  const typeICounts = useMemo(() => infractions.filter(inf => inf.type === "Tipo I").length, [infractions]);
  const typeIICounts = useMemo(() => infractions.filter(inf => inf.type === "Tipo II").length, [infractions]);
  const typeIIICounts = useMemo(() => infractions.filter(inf => inf.type === "Tipo III").length, [infractions]);


  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const { students: fetchedStudents, infractions: fetchedInfractions, settings: fetchedSettings } = await fetchOverviewData();
      setStudents(fetchedStudents);
      setInfractions(fetchedInfractions);
      setSettings(fetchedSettings);
    } catch (err) {
       const message = err instanceof Error ? err.message : "Failed to load dashboard data";
       setError(message);
       toast.error(message);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []); // Fetch on mount

   // --- Alert Calculation Logic (specific to Overview) ---
   const getStudentAlertStatus = (studentId: string): AlertStatus | null => {
     if (!settings) return null; // Need settings to calculate

     const student = students.find((s) => s.id === studentId);
     if (!student) return null;

     const typeICount = getStudentTypeICount(studentId, infractions);
     const sectionCategory = getSectionCategory(student.grado);

     const sectionSettings = settings.sections[sectionCategory];
     const primaryThreshold = sectionSettings?.primary ?? settings.primary.threshold;
     const secondaryThreshold = sectionSettings?.secondary ?? settings.secondary.threshold;

     if (typeICount >= secondaryThreshold) {
         return { level: "critical", count: typeICount };
     } else if (typeICount >= primaryThreshold) {
         return { level: "warning", count: typeICount };
     }
     return null;
 };

 // Effect for showing alert toast (if desired)
  useEffect(() => {
    if (!loading && !error && settings) { // Ensure data is loaded
        const studentsWithAlerts = students.filter(
            (student) => getStudentAlertStatus(student.id) !== null
        );
        if (studentsWithAlerts.length > 0) {
            toast.info(`Hay ${studentsWithAlerts.length} estudiantes con alertas activas.`);
        }
    }
  }, [loading, error, students, infractions, settings]); // Re-run when data changes

  const handleSelectStudent = (studentId: string) => {
    router.push(`/dashboard/students/${studentId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-150px)]">
         <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-150px)] text-destructive">
         <p className="mb-4">{error}</p>
         <button onClick={fetchData} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Reintentar</button>
      </div>
    );
  }

  // Ensure settings are loaded before rendering Overview which depends on them
  if (!settings) {
       return (
            <div className="flex items-center justify-center h-[calc(100vh-150px)] text-muted-foreground">
                Cargando configuración...
            </div>
        );
  }


  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Resumen General</h1>
      <Overview
        typeICounts={typeICounts}
        typeIICounts={typeIICounts}
        typeIIICounts={typeIIICounts}
        students={students}
        infractions={infractions}
        settings={settings} // Pass settings down
        getStudentAlertStatus={getStudentAlertStatus} // Pass calculation function
        onSelectStudent={handleSelectStudent}
      />
    </div>
  );
}