// src/hooks/use-dashboard-data.tsx
"use client";

import { useState, useEffect } from "react";
import type {
  Student,
  Infraction,
  FollowUp,
  AlertSettings,
} from "@/types/dashboard";
import { getStudentTypeICount, type AlertStatus } from "@/lib/utils";
import { toast } from "sonner";

export function useDashboardData() {
  const [students, setStudents] = useState<Student[]>([]);
  const [infractions, setInfractions] = useState<Infraction[]>([]);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [alertSettings, setAlertSettings] = useState<AlertSettings[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Derived state
  const [typeICounts, setTypeICounts] = useState(0);
  const [typeIICounts, setTypeIICounts] = useState(0);
  const [typeIIICounts, setTypeIIICounts] = useState(0);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [studentsRes, infractionsRes, followUpsRes, settingsRes] =
          await Promise.all([
            fetch("/api/students", {
                headers: {
                    Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
                }
            }),
            fetch("/api/infractions", {
                headers: {
                    Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
                }
            }),
            fetch("/api/followups", {
                headers: {
                    Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
                }
            }),
            fetch("/api/alert-settings", {
                headers: {
                    Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
                }
            }),
          ]);

        if (
          !studentsRes.ok ||
          !infractionsRes.ok ||
          !followUpsRes.ok ||
          !settingsRes.ok
        ) {
           let errorMessage = "Error fetching data";
            if (studentsRes.status === 401 || infractionsRes.status === 401 || followUpsRes.status === 401 || settingsRes.status === 401) {
              errorMessage = "Unauthorized: Invalid API Key";
            }
            throw new Error(errorMessage);
        }

        const [studentsData, infractionsData, followUpsData, settingsData] =
          await Promise.all([
            studentsRes.json(),
            infractionsRes.json(),
            followUpsRes.json(),
            settingsRes.json(),
          ]);

        setStudents(studentsData);
        setInfractions(infractionsData);
        setFollowUps(followUpsData);
        setAlertSettings(settingsData);
        setError(null);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        console.error("Error fetching data:", err);
        setError(err.message || "Error loading data. Please try again later.");
        toast.error(err.message || "Error loading data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

    // Calculate counts, no need useMemo
    useEffect(() => {
        const typeI = infractions.filter((inf) => inf.type === "I").length;
        const typeII = infractions.filter((inf) => inf.type === "II").length;
        const typeIII = infractions.filter((inf) => inf.type === "III").length;

        setTypeICounts(typeI);
        setTypeIICounts(typeII);
        setTypeIIICounts(typeIII);
    }, [infractions]);

  // Add new follow-up -  Consider moving this to an API POST request
  const addFollowUp = (followUp: FollowUp) => {
    setFollowUps((prev) => [...prev, followUp]);
    // Ideally, also send a POST request to /api/followups to persist this
  };

  // Update alert settings - Consider moving this to an API POST/PUT request
  const updateAlertSettings = (settings: AlertSettings) => {
    setAlertSettings(settings);
    // Ideally, send a POST/PUT request to /api/alert-settings to persist this
  };

// Get alert status for a student
const getStudentAlertStatus = (studentId: string): AlertStatus | null => {
  const student = students.find((s) => s.id === studentId);
  if (!student) return null;

  const typeICount = getStudentTypeICount(studentId, infractions);
  const defaultPrimaryThreshold = alertSettings.length > 0 ? alertSettings[0].primary_threshold : 3;
  // Get threshold for this student's section, use find instead of sections
  const sectionSetting = alertSettings.find(
    (setting) => setting.seccion === student.section
  );
  const primaryThreshold = sectionSetting
    ? sectionSetting.primary_threshold
    : defaultPrimaryThreshold;

  if (typeICount >= primaryThreshold) {
      //Find if is critical
      const defaultSecondaryThreshold = alertSettings.length > 0 ? alertSettings[0].secondary_threshold : 3;
      const secondaryThreshold = sectionSetting
      ? sectionSetting.secondary_threshold
      : defaultSecondaryThreshold;

    if(typeICount >= secondaryThreshold){
        return { level: "critical", count: typeICount };
    }
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