/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import type {
  Student,
  Infraction,
  FollowUp,
  AlertSettings,
} from "@/types/dashboard";
import { getStudentTypeICount, type AlertStatus } from "@/lib/utils";
import { SECCIONES_ACADEMICAS } from "@/lib/constants"

// Sample data for demonstration

export function useDashboardData() {
  const [students, setStudents] = useState<Student[]>([])
  const [infractions, setInfractions] = useState<Infraction[]>([])
  const [followUps, setFollowUps] = useState<FollowUp[]>([])
  const [alertSettings, setAlertSettings] = useState<AlertSettings[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Derived state
  const [typeICounts, setTypeICounts] = useState(0);
  const [typeIICounts, setTypeIICounts] = useState(0);
  const [typeIIICounts, setTypeIIICounts] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [studentsRes, infractionsRes, followUpsRes, settingsRes] = await Promise.all([
          fetch("/api/students"),
          fetch("/api/infractions"),
          fetch("/api/followups"),
          fetch("/api/alert-settings"),
        ])

        if (!studentsRes.ok || !infractionsRes.ok || !followUpsRes.ok || !settingsRes.ok) {
          throw new Error("Error fetching data")
        }

        const [studentsData, infractionsData, followUpsData, settingsData] = await Promise.all([
          studentsRes.json(),
          infractionsRes.json(),
          followUpsRes.json(),
          settingsRes.json(),
        ])

        // Transformar los datos
        const transformedStudents = studentsData.map((student: any) => ({
          id: `${student.id}-${student.codigo}`,
          name: student.nombre || "",
          section: student.seccion_normalizada || "",
        }))

        const transformedInfractions = infractionsData.map((infraction: any) => ({
          id: infraction.hash,
          studentId: `${infraction.id_estudiante}-${infraction.codigo_estudiante}`,
          type: infraction.tipo_falta || "",
          number: infraction.numero_falta?.toString() || "",
          date: infraction.fecha?.split("T")[0] || "",
        }))

        const transformedFollowUps = followUpsData.map((followUp: any) => ({
          id: `FUP${followUp.id_seguimiento}`,
          infractionId: followUp.id_caso.toString(),
          followUpNumber: followUp.id_seguimiento,
          date: followUp.fecha_seguimiento?.split("T")[0] || "",
        }))

        setStudents(transformedStudents)
        setInfractions(transformedInfractions)
        setFollowUps(transformedFollowUps)
        setAlertSettings(settingsData)
        setError(null)
      } catch (err) {
        console.error("Error fetching data:", err)
        setError("Error loading data. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])




  // Calculate counts
  useEffect(() => {
    // Count infractions by type
    const typeI = infractions.filter((inf) => inf.type === "I").length;
    const typeII = infractions.filter((inf) => inf.type === "II").length;
    const typeIII = infractions.filter((inf) => inf.type === "III").length;

    setTypeICounts(typeI);
    setTypeIICounts(typeII);
    setTypeIIICounts(typeIII);
  }, [infractions]);

  // Add new follow-up
  const addFollowUp = (followUp: FollowUp) => {
    setFollowUps((prev) => [...prev, followUp]);
  };

  // Update alert settings
  const updateAlertSettings = (settings: AlertSettings) => {
    setAlertSettings(settings);
  };

  // Get alert status for a student
  const getStudentAlertStatus = (studentId: string): AlertStatus | null => {
    const student = students.find((s) => s.id === studentId);
    if (!student) return null;

    const typeICount = getStudentTypeICount(studentId, infractions);

    // Get threshold for this student's section
    const sectionThreshold =
      alertSettings.sections[student.section]?.primary ||
      alertSettings.primary.threshold;

    if (typeICount >= sectionThreshold) {
      return { level: "warning", count: typeICount };
    }

    return null;
  };

  return {
    students,
    infractions,
    followUps,
    addFollowUp,
    typeICounts,
    typeIICounts,
    typeIIICounts,
    alertSettings,
    updateAlertSettings,
    getStudentAlertStatus,
    loading,
    error,
  };
}
