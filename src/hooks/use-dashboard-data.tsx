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
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  const handleApiError = (response: Response, endpoint: string) => {
    if (response.status === 401) {
      return "Unauthorized: Invalid API Key";
    }
    if (response.status === 404) {
      return `Not Found: ${endpoint} endpoint not available`;
    }
    if (response.status === 500) {
      return "Server Error: Please try again later";
    }
    return `Error fetching ${endpoint}: ${response.statusText}`;
  };

  const validateData = (data: any, type: string) => {
    if (!Array.isArray(data)) {
      throw new Error(`Invalid ${type} data format: expected array`);
    }
    return data;
  };

  // Fetch data function with retry mechanism
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("Fetching dashboard data...");

      const endpoints = [
        { url: "/api/students", name: "students" },
        { url: "/api/infractions", name: "infractions" },
        { url: "/api/followups", name: "followups" },
        { url: "/api/alert-settings", name: "alert-settings" },
      ];

      const responses = await Promise.all(
        endpoints.map((endpoint) =>
          fetch(endpoint.url).then((response) => ({
            response,
            name: endpoint.name,
          }))
        )
      );

      // Check for any failed responses
      const failedResponse = responses.find(({ response }) => !response.ok);
      if (failedResponse) {
        throw new Error(
          handleApiError(failedResponse.response, failedResponse.name)
        );
      }

      // Parse all responses
      const [studentsData, infractionsData, followUpsData, settingsData] =
        await Promise.all(responses.map(({ response }) => response.json()));

      // Validate data
      const validatedStudents = validateData(studentsData, "students");
      const validatedInfractions = validateData(infractionsData, "infractions");
      const validatedFollowUps = validateData(followUpsData, "followups");

      console.log("Data fetched successfully:", {
        students: validatedStudents.length,
        infractions: validatedInfractions.length,
        followUps: validatedFollowUps.length,
      });

      setStudents(validatedStudents);
      setInfractions(validatedInfractions);
      setFollowUps(validatedFollowUps);
      setAlertSettings(settingsData);
      setRetryCount(0); // Reset retry count on success
    } catch (err: any) {
      console.error("Error fetching data:", err);
      const errorMessage =
        err.message || "Error loading data. Please try again later.";
      setError(errorMessage);
      toast.error(errorMessage);

      // Implement retry mechanism
      if (retryCount < MAX_RETRIES) {
        console.log(`Retrying... Attempt ${retryCount + 1} of ${MAX_RETRIES}`);
        setRetryCount((prev) => prev + 1);
      }
    } finally {
      setLoading(false);
    }
  }, [retryCount]); // Add retryCount to dependencies

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
  const updateAlertSettings = useCallback(
    async (settings: AlertSettings) => {
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
        await fetchData(); // Refetch to get the latest data
        toast.success("Alert settings updated successfully.");
      } catch (error) {
        console.error("There was a problem with the fetch operation:", error);
        toast.error("Failed to update alert settings.");
      }
    },
    [fetchData]
  ); // Depends on fetchData

  const getStudentAlertStatus = useCallback(
    (studentId: string): AlertStatus | null => {
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
    },
    [students, infractions, alertSettings]
  ); // Depend on relevant state

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
