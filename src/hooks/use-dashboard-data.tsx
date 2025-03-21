// src/hooks/use-dashboard-data.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import type {
  Student,
  Infraction,
  FollowUp,
  AlertSettings,
} from "@/types/dashboard";
import { getStudentTypeICount, type AlertStatus } from "@/lib/utils";
import { toast } from "sonner";
import { getSectionCategory } from "@/lib/constantes";

export function useDashboardData() {
  const [students, setStudents] = useState<Student[]>([]);
  const [infractions, setInfractions] = useState<Infraction[]>([]);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [alertSettings, setAlertSettings] = useState<AlertSettings>({
    primary: { threshold: 3 },
    secondary: { threshold: 5 },
    sections: {},
  }); // Initialize
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data function, useCallback for memoization
  const fetchData = useCallback(async () => {
      try {
          setLoading(true);
          setError(null); // Clear previous errors

          const [studentsRes, infractionsRes, followUpsRes, settingsRes] =
              await Promise.all([
                  fetch("/api/students"),
                  fetch("/api/infractions"),
                  fetch("/api/followups"),
                  fetch("/api/alert-settings"),
              ]);

        if (!studentsRes.ok ||!infractionsRes.ok ||!followUpsRes.ok ||!settingsRes.ok) {
          let errorMessage = "Error fetching data";
          if (
            studentsRes.status === 401 ||
            infractionsRes.status === 401 ||
            followUpsRes.status === 401 ||
            settingsRes.status === 401
          ) {
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        console.error("Error fetching data:", err);
        setError(err.message || "Error loading data. Please try again later.");
        toast.error(err.message || "Error loading data. Please try again later.");
      } finally {
        setLoading(false);
      }
    }, []); // Empty dependency array, only runs once

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Add new follow-up (with API call)
  const addFollowUp = useCallback(async (followUp: FollowUp) => {
    try {
        const response = await fetch("/api/followups", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(followUp),
        });

        if (!response.ok) {
            throw new Error("Network response was not ok");
        }
        const newFollowUp = await response.json(); // Get the *actual* new follow-up (with server-generated ID)
        setFollowUps((prev) => [...prev, newFollowUp]); // Use the followUp from the response

    } catch (error) {
        console.error("There was a problem with the fetch operation:", error);
         toast.error("Failed to add follow-up.");
    }
}, []); // Depend on nothing, so it doesn't change

  // Update alert settings (with API call)
const updateAlertSettings = useCallback(async (settings: AlertSettings) => {
    try {
        const response = await fetch("/api/alert-settings", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(settings),
        });

        if (!response.ok) {
            throw new Error("Network response was not ok");
        }
        // No need to update local state here, refetch instead
        await fetchData();  // Refetch to get the latest data
        toast.success("Alert settings updated successfully.");

    } catch (error) {
        console.error("There was a problem with the fetch operation:", error);
        toast.error("Failed to update alert settings.");
    }
}, [fetchData]); // Depends on fetchData


const getStudentAlertStatus = useCallback((studentId: string): AlertStatus | null => {
    const student = students.find((s) => s.id === studentId);
    if (!student) return null;

    const typeICount = getStudentTypeICount(studentId, infractions);

    // Use getSectionCategory to get the correct level
    const sectionCategory = getSectionCategory(student.grado);

    // Get thresholds, using defaults if not set for the section
    const primaryThreshold =
        alertSettings.sections[sectionCategory]?.primary ??
        alertSettings.primary.threshold;
    const secondaryThreshold =
        alertSettings.sections[sectionCategory]?.secondary ??
        alertSettings.secondary.threshold;

    if (typeICount >= secondaryThreshold) {
        return { level: "critical", count: typeICount };
    } else if (typeICount >= primaryThreshold) {
        return { level: "warning", count: typeICount };
    }

    return null;
}, [students, infractions, alertSettings]); // Depend on relevant state



  return {
    students,
    infractions,
    followUps,
    addFollowUp,
    alertSettings,
    updateAlertSettings,
    getStudentAlertStatus,
    loading,
    error,
  };
}