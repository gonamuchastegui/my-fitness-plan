// Google Sheets API integration
// This will connect to your Google Sheets via Apps Script Web App

interface Exercise {
  id: string
  name: string
  imageUrl: string
  category: string
  instructions?: string
}

interface WorkoutPlan {
  id: string
  name: string
  description: string
  exercises: {
    exerciseId: string
    targetSets: number
    targetReps: string
    restTime: number
  }[]
  frequency: string
  isActive: boolean
}

interface WorkoutLog {
  id: string
  date: string
  exerciseId: string
  exerciseName: string
  weight: number
  reps: number
  sets: number
  planName: string
}

interface BestScore {
  exerciseId: string
  exerciseName: string
  bestWeight: number
  bestReps: number
  achievedDate: string
  category: string
}

class SheetsAPI {
  private baseUrl: string

  constructor() {
    // Use local proxy instead of direct Google Apps Script URL
    this.baseUrl = '/api/proxy'
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}?action=${endpoint}`
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: endpoint, ...JSON.parse(options.body as string || '{}') }),
        ...options,
      })
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
  
      return await response.json()
    } catch (error) {
      console.error(`Error in ${endpoint}:`, error)
      throw error
    }
  }

  // Workout Plans
  async getWorkoutPlans(): Promise<WorkoutPlan[]> {
    return this.makeRequest('getPlans')
  }

  async getWorkoutPlan(planId: string): Promise<WorkoutPlan> {
    return this.makeRequest('getPlan', {
      body: JSON.stringify({ planId })
    })
  }

  async updateWorkoutPlan(plan: WorkoutPlan): Promise<void> {
    return this.makeRequest('updatePlan', {
      body: JSON.stringify({ plan })
    })
  }

  // Exercises
  async getExercises(): Promise<Exercise[]> {
    return this.makeRequest('getExercises')
  }

  async getExercise(exerciseId: string): Promise<Exercise> {
    return this.makeRequest('getExercise', {
      body: JSON.stringify({ exerciseId })
    })
  }

  // Get Plan Details
  async getPlanDetails(planId: string): Promise<{
    planName: string
    exercises: Array<{
      id: string
      name: string
      imageUrl: string
      lastWeight: number
      lastReps: number
      lastSets: number
      targetSets: number
      targetReps: string
      restTime: number
    }>
  }> {
    return this.makeRequest('getPlanDetails', {
      body: JSON.stringify({ planId })
    })
  }

  // Workout Logging
  async logWorkout(workoutData: {
    date: string
    planName: string
    exercises: Array<{
      exerciseId: string
      exerciseName: string
      weight: number
      reps: number
      sets: number
    }>
  }): Promise<void> {
    return this.makeRequest('logWorkout', {
      body: JSON.stringify({ workoutData })
    })
  }

  async logExerciseSet(exerciseData: {
    date: string
    exerciseId: string
    exerciseName: string
    weight: number
    reps: number
    setNumber: number
    planName: string
  }): Promise<void> {
    return this.makeRequest('logSet', {
      body: JSON.stringify({ exerciseData })
    })
  }

  // History
  async getWorkoutHistory(filters?: {
    exerciseId?: string
    startDate?: string
    endDate?: string
    limit?: number
  }): Promise<WorkoutLog[]> {
    return this.makeRequest('getHistory', {
      body: JSON.stringify({ filters })
    })
  }

  async getExerciseHistory(exerciseId: string): Promise<WorkoutLog[]> {
    return this.makeRequest('getExerciseHistory', {
      body: JSON.stringify({ exerciseId })
    })
  }

  // Best Scores
  async getBestScores(): Promise<BestScore[]> {
    return this.makeRequest('getBestScores')
  }

  async updateBestScore(scoreData: {
    exerciseId: string
    exerciseName: string
    weight: number
    reps: number
    date: string
  }): Promise<void> {
    return this.makeRequest('updateBestScore', {
      body: JSON.stringify({ scoreData })
    })
  }
}

export const sheetsAPI = new SheetsAPI()

// Utility functions for data transformation
export function formatWorkoutDate(date: Date): string {
  return date.toISOString().split('T')[0]
}

export function parseWorkoutDate(dateString: string): Date {
  return new Date(dateString)
}

export function calculateOneRepMax(weight: number, reps: number): number {
  // Epley formula: 1RM = weight × (1 + reps/30)
  return Math.round(weight * (1 + reps / 30))
}

export function isPersonalRecord(currentWeight: number, currentReps: number, bestWeight: number, bestReps: number): boolean {
  const currentMax = calculateOneRepMax(currentWeight, currentReps)
  const bestMax = calculateOneRepMax(bestWeight, bestReps)
  return currentMax > bestMax
}
