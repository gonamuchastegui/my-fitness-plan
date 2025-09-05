'use client'

import { useState, useEffect } from 'react'
import { Target, History, Calendar, Dumbbell, Clock, Play, TrendingUp } from 'lucide-react'
import { sheetsAPI } from '@/lib/sheets'
import ExerciseCard from '@/components/ExerciseCard'

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

interface Exercise {
  id: string
  name: string
  imageUrl: string
  category: string
  instructions?: string
}

export default function HomePage() {
  const [plans, setPlans] = useState<WorkoutPlan[]>([])
  const [history, setHistory] = useState<WorkoutLog[]>([])
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [bestScores, setBestScores] = useState<Record<string, { weight: number; reps: number }>>({})
  const [loading, setLoading] = useState(true)
  const [savingWorkout, setSavingWorkout] = useState(false) // ✅ Nuevo estado para el loader
  const [selectedPlan, setSelectedPlan] = useState<WorkoutPlan | null>(null)
  const [selectedPlanExercises, setSelectedPlanExercises] = useState<any[]>([])
  const [completedSets, setCompletedSets] = useState<Record<string, Array<{
    weight: number
    reps: number
    setNumber: number
  }>>>({})

  // Helper function to get today's date in YYYY-MM-DD format (local timezone)
  const getTodayDate = () => {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Add timeout to prevent hanging requests
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), 10000)
        )
        
        const [plansData, historyData, exercisesData] = await Promise.race([
          Promise.all([
            sheetsAPI.getWorkoutPlans().catch(() => []),
            sheetsAPI.getWorkoutHistory({ limit: 50 }).catch(() => []),
            sheetsAPI.getExercises().catch(() => [])
          ]),
          timeoutPromise
        ]) as [WorkoutPlan[], WorkoutLog[], Exercise[]]
        
        setPlans(plansData || [])
        setHistory(historyData || [])
        setExercises(exercisesData || [])
        
        // Calculate best scores from history
        if (historyData && historyData.length > 0) {
          const scores: Record<string, { weight: number; reps: number }> = {}
          historyData.forEach((log: WorkoutLog) => {
            const key = log.exerciseId
            if (!scores[key] || log.weight > scores[key].weight) {
              scores[key] = { weight: log.weight, reps: log.reps }
            }
          })
          setBestScores(scores)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
        // Set empty arrays as fallback
        setPlans([])
        setHistory([])
        setExercises([])
        setBestScores({})
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleStartWorkout = async (plan: WorkoutPlan) => {
    setSelectedPlan(plan)
    
    // Get exercises for the selected plan
    const planExercises = plan.exercises.map(planEx => {
      const exercise = exercises.find(ex => ex.id === planEx.exerciseId)
      const lastLog = history
        .filter(log => log.exerciseId === planEx.exerciseId)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
      
      return {
        id: exercise?.id || planEx.exerciseId,
        name: exercise?.name || 'Unknown Exercise',
        imageUrl: exercise?.imageUrl || '',
        lastWeight: lastLog ? lastLog.weight : 0,
        lastReps: lastLog ? lastLog.reps : 8,
        lastSets: lastLog ? lastLog.sets : 0,
        targetSets: planEx.targetSets,
        targetReps: planEx.targetReps,
        restTime: planEx.restTime
      }
    })
    
    setSelectedPlanExercises(planExercises)
    setCompletedSets({})
  }

  const handleSetComplete = (exerciseId: string, setData: { weight: number; reps: number; setNumber: number }) => {
    setCompletedSets(prev => ({
      ...prev,
      [exerciseId]: [...(prev[exerciseId] || []), setData]
    }))
  }

  const handleCompleteWorkout = async () => {
    if (!selectedPlan) return

    // Verify all exercises have completed sets
    const allExercisesCompleted = selectedPlanExercises.every(exercise => {
      const sets = completedSets[exercise.id] || []
      return sets.length >= exercise.targetSets
    })

    if (!allExercisesCompleted) {
      alert('Please complete all sets for all exercises before finishing the workout.')
      return
    }

    try {
      setSavingWorkout(true) // ✅ Activar loader
      
      const todayDate = getTodayDate()
      console.log('📅 Fecha que se va a enviar:', todayDate)
      console.log('📅 Fecha actual del navegador:', new Date().toLocaleDateString())
      
      const workoutData = {
        date: todayDate,
        planName: selectedPlan.name,
        exercises: selectedPlanExercises.map(exercise => {
          const sets = completedSets[exercise.id] || []
          return {
            exerciseId: exercise.id,
            exerciseName: exercise.name,
            weight: sets[0]?.weight || exercise.lastWeight,
            reps: sets[0]?.reps || exercise.lastReps,
            sets: sets.length
          }
        })
      }

      console.log('📦 Datos del workout:', workoutData)
      await sheetsAPI.logWorkout(workoutData)
      
      // Reset state and refresh data
      setSelectedPlan(null)
      setSelectedPlanExercises([])
      setCompletedSets({})
      
      // Refresh history
      const newHistory = await sheetsAPI.getWorkoutHistory({ limit: 50 })
      console.log(' Historial recibido:', newHistory)
      setHistory(newHistory)
      
      alert('Workout completed and saved successfully! 🎉')
    } catch (error) {
      console.error('Error completing workout:', error)
      alert('Failed to complete workout. Please try again.')
    } finally {
      setSavingWorkout(false) // ✅ Desactivar loader
    }
  }

  const handleBackToPlans = () => {
    setSelectedPlan(null)
    setSelectedPlanExercises([])
    setCompletedSets({})
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your fitness data...</p>
        </div>
      </div>
    )
  }

  // If a plan is selected, show the workout view
  if (selectedPlan && selectedPlanExercises.length > 0) {
    return (
      <div className="space-y-8 px-8 sm:px-12 lg:px-16 py-8">
        {/* Workout Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{selectedPlan.name}</h1>
            <p className="text-gray-600 mt-1">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          <button 
            onClick={handleBackToPlans}
            className="btn-secondary"
          >
            Back to Plans
          </button>
        </div>

        {/* Exercises */}
        <div className="space-y-6">
          {selectedPlanExercises.map((exercise, index) => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              exerciseNumber={index + 1}
              onSetComplete={handleSetComplete}
            />
          ))}
        </div>

        {/* Workout Actions */}
        <div className="flex gap-4 pt-6 border-t border-gray-200">
          <button 
            onClick={handleCompleteWorkout}
            disabled={savingWorkout} // ✅ Deshabilitar botón mientras guarda
            className={`btn-primary flex-1 flex items-center justify-center gap-2 ${
              savingWorkout ? 'opacity-75 cursor-not-allowed' : ''
            }`}
          >
            {savingWorkout ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Saving Workout...
              </>
            ) : (
              'Complete Workout'
            )}
          </button>
        </div>
      </div>
    )
  }

  // Main view with plans and history
  return (
    <div className="space-y-12 px-8 sm:px-12 lg:px-16 py-8">
      {/* Hero Section */}
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold text-gray-900">My Fitness Plan</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Choose your workout routine and track your progress over time.
        </p>
      </div>

      {/* My Plans Section */}
      <section>
        <h2 className="text-2xl font-semibold mb-8 flex items-center gap-2">
          <Target className="w-6 h-6 text-primary-600" />
          My Plans
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {plans.filter(plan => plan.isActive).map((plan) => (
            <div key={plan.id} className="card hover:shadow-md transition-shadow">
              <div className="space-y-6">
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold text-lg text-gray-900">{plan.name}</h3>
                  <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full font-medium">
                    Active
                  </span>
                </div>
                
                <p className="text-gray-600 text-sm">{plan.description}</p>
                
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Dumbbell className="w-4 h-4" />
                    <span>{plan.exercises.length} exercises</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>~{plan.exercises.length * 15} minutes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{plan.frequency}</span>
                  </div>
                </div>
                
                <button 
                  onClick={() => handleStartWorkout(plan)}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  Start Workout
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Workout History Section */}
      <section>
        <h2 className="text-2xl font-semibold mb-8 flex items-center gap-2">
          <History className="w-6 h-6 text-secondary-600" />
          Recent Workouts
        </h2>
        
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
              .slice(0, 10)

            return sortedHistory.map((workout, index) => (
              <div key={index} className="card">
                <div className="space-y-4">
                  {/* Header with Date and Plan */}
                  <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                    <div>
                      <h4 className="font-semibold text-lg text-gray-900">
                        {new Date(workout.date).toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </h4>
                      <p className="text-lg font-medium text-primary-600">{workout.planName}</p>
                    </div>
                    <div className="text-sm text-gray-500">
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
      </section>
    </div>
  )
}


