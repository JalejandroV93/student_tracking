import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Infraction } from "@/types/dashboard"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


// Generate a random ID
export function generateId() {
  return Math.random().toString(36).substring(2, 9)
}

// Format date to local string
export function formatDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleDateString()
}

// Get count of Type I infractions for a student
export function getStudentTypeICount(studentId: string, infractions: Infraction[]) {
  return infractions.filter((inf) => inf.studentId === studentId && inf.type === "I").length
}

// Calculate expected follow-up dates based on infraction date
export function calculateExpectedFollowUpDates(infractionDate: string) {
  const date = new Date(infractionDate)

  // 1st follow-up: 1 month after
  const firstFollowUp = new Date(date)
  firstFollowUp.setMonth(date.getMonth() + 1)

  // 2nd follow-up: 3 months after
  const secondFollowUp = new Date(date)
  secondFollowUp.setMonth(date.getMonth() + 3)

  // 3rd follow-up: 6 months after
  const thirdFollowUp = new Date(date)
  thirdFollowUp.setMonth(date.getMonth() + 6)

  return [
    firstFollowUp.toISOString().split("T")[0],
    secondFollowUp.toISOString().split("T")[0],
    thirdFollowUp.toISOString().split("T")[0],
  ]
}

// Alert status type
export interface AlertStatus {
  level: "warning" | "critical"
  count: number
}