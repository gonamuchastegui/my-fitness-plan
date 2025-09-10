'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Trophy, Target, TrendingUp } from 'lucide-react'
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

interface BestScore {
  exerciseId: string
  exerciseName: string
  weight: number
  reps: number
  date: string
}

export default function BestScoresPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [bestScores, setBestScores] = useState<BestScore[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }

    if (status === 'authenticated') {
      fetchBestScores()
    }
  }, [status, router])

  const fetchBestScores = async () => {
    try {
      setLoading(true)
      const historyData = await sheetsAPI.getWorkoutHistory({ limit: 1000 })
      
      // Calculate best scores from history
      const scores: Record<string, BestScore> = {}
      historyData.forEach((log: WorkoutLog) => {
        const key = log.exerciseId
        if (!scores[key] || log.weight > scores[key].weight) {
          scores[key] = {
            exerciseId: log.exerciseId,
            exerciseName: log.exerciseName,
            weight: log.weight,
            reps: log.reps,
            date: log.date
          }
        }
      })
      
      setBestScores(Object.values(scores))
    } catch (error) {
      console.error('Error fetching best scores:', error)
      setBestScores([])
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="space-y-8 px-8 sm:px-12 lg:px-16 py-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your best scores...</p>
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
          <Trophy className="w-10 h-10 text-yellow-500" />
          Best Scores
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Your personal records across all exercises.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {bestScores.map((score, index) => (
          <div key={score.exerciseId} className="card">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg text-gray-900">{score.exerciseName}</h3>
                <div className="flex items-center gap-1 text-yellow-500">
                  <Trophy className="w-5 h-5" />
                  <span className="text-sm font-medium">PR</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Weight:</span>
                  <span className="font-bold text-xl text-primary-600">{score.weight}kg</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Reps:</span>
                  <span className="font-semibold text-lg text-gray-900">{score.reps}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span className="text-sm text-gray-500">
                    {new Date(score.date).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {bestScores.length === 0 && (
        <div className="card text-center py-12">
          <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No personal records yet</h3>
          <p className="text-gray-600">Complete some workouts to start tracking your best scores.</p>
        </div>
      )}
    </div>
  )
}
