export interface Student {
  id: string
  name: string
  section: string
}

export interface Infraction {
  id: string
  studentId: string
  type: "I" | "II" | "III"
  number: string
  date: string
}

export interface FollowUp {
  id: string
  infractionId: string
  followUpNumber: number
  date: string
}

export interface AlertSettings {
  primary: {
    threshold: number
  }
  secondary: {
    threshold: number
  }
  sections: {
    [key: string]: {
      primary: number
      secondary: number
    }
  }
}

