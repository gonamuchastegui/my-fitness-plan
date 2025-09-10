'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { History, Calendar, Dumbbell, Clock } from 'lucide-react'
import { sheetsAPI } from '@/lib/sheets'

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

export default function HistoryPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [history, setHistory] = useState<WorkoutLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }

    if (status === 'authenticated') {
      fetchHistory()
    }
  }, [status, router])

  const fetchHistory = async () => {
    try {
      setLoading(true)
      const historyData = await sheetsAPI.getWorkoutHistory({ limit: 100 })
      setHistory(historyData || [])
    } catch (error) {
      console.error('Error fetching history:', error)
      setHistory([])
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="space-y-8 px-8 sm:px-12 lg:px-16 py-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your workout history...</p>
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return null
  }

  return (
    <div className="space-y-8 px-8 sm:px-12 lg:px-16 py-8">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold text-gray-900 flex items-center justify-center gap-3">
          <History className="w-10 h-10 text-primary-600" />
          Workout History
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Track your progress and see how you've improved over time.
        </p>
      </div>

      <div className="space-y-6">
        {(() => {
          // Group history by date and plan
          const groupedHistory = history.reduce((acc, log) => {
            const key = `${log.date}-${log.planName}`
            if (!acc[key]) {
              acc[key] = {
                date: log.date,
                planName: log.planName,
                exercises: []
              }
            }
            acc[key].exercises.push(log)
            return acc
          }, {} as Record<string, { date: string; planName: string; exercises: WorkoutLog[] }>)

          // Convert to array and sort by date (newest first)
          const sortedHistory = Object.values(groupedHistory)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

          return sortedHistory.map((workout, index) => (
            <div key={index} className="card">
              <div className="space-y-4">
                {/* Header with Date and Plan */}
                <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                  <div>
                    <h4 className="font-semibold text-lg text-gray-900 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-primary-600" />
                      {new Date(workout.date).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        month: 'long', 
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </h4>
                    <p className="text-lg font-medium text-primary-600">{workout.planName}</p>
                  </div>
                  <div className="text-sm text-gray-500 flex items-center gap-1">
                    <Dumbbell className="w-4 h-4" />
                    {workout.exercises.length} exercises
                  </div>
                </div>

                {/* List of Exercises */}
                <div className="space-y-3">
                  {workout.exercises.map((exercise, exerciseIndex) => (
                    <div key={exerciseIndex} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <h5 className="font-medium text-gray-900">{exercise.exerciseName}</h5>
                      </div>
                      <div className="flex items-center gap-6 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <span className="font-medium">{exercise.weight}kg</span>
                        </span>
                        <span>{exercise.reps} reps</span>
                        <span>{exercise.sets} sets</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))
        })()}

        {history.length === 0 && (
          <div className="card text-center py-12">
            <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No workout history yet</h3>
            <p className="text-gray-600">Start your first workout to see your progress here.</p>
          </div>
        )}
      </div>
    </div>
  )
}
