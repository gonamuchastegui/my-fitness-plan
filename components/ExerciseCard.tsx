'use client'

import { useState } from 'react'
import { Clock, Repeat, Weight, RotateCcw, Image as ImageIcon, Save } from 'lucide-react'
import Image from 'next/image'

interface Exercise {
  id: string
  name: string
  imageUrl: string
  lastWeight: number
  lastReps: number
  lastSets: number
  targetSets: number
  targetReps: string
  restTime: number
}

interface ExerciseCardProps {
  exercise: Exercise
  exerciseNumber: number
  onSetComplete: (exerciseId: string, setData: { weight: number; reps: number; setNumber: number }) => void
}

export default function ExerciseCard({ exercise, exerciseNumber, onSetComplete }: ExerciseCardProps) {
  const [currentWeight, setCurrentWeight] = useState(exercise.lastWeight)
  const [currentReps, setCurrentReps] = useState(exercise.lastReps)
  const [currentSets, setCurrentSets] = useState(0)
  const [completedSets, setCompletedSets] = useState<number[]>([])

  const handleSetComplete = () => {
    if (currentWeight <= 0 || currentReps <= 0) {
      alert('Please enter valid weight and reps')
      return
    }

    if (currentSets < exercise.targetSets) {
      const newSetNumber = currentSets + 1
      setCurrentSets(newSetNumber)
      setCompletedSets([...completedSets, newSetNumber])
      
      // Guardar localmente (no en la base de datos)
      onSetComplete(exercise.id, {
        weight: currentWeight,
        reps: currentReps,
        setNumber: newSetNumber
      })
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="card border-l-4 border-l-primary-500">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Exercise Image */}
        <div className="lg:w-48 flex-shrink-0">
          <div className="relative w-full h-32 lg:h-36 bg-gray-100 rounded-lg overflow-hidden">
            {exercise.imageUrl.includes('/api/placeholder') ? (
              <div className="w-full h-full flex items-center justify-center">
                <ImageIcon className="w-12 h-12 text-gray-400" />
              </div>
            ) : (
              <Image
                src={exercise.imageUrl}
                alt={exercise.name}
                fill
                className="object-cover"
              />
            )}
          </div>
        </div>

        {/* Exercise Details */}
        <div className="flex-1 space-y-4">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div>
              <h4 className="text-lg font-semibold text-gray-900">
                {exerciseNumber}. {exercise.name}
              </h4>
              <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                <span className="flex items-center gap-1">
                  <Repeat className="w-4 h-4" />
                  {exercise.targetSets} sets × {exercise.targetReps} reps
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {formatTime(exercise.restTime)} rest
                </span>
              </div>
            </div>

          </div>

          {/* Last Performance */}
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-sm text-gray-600 mb-2">Last performance:</p>
            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1">
                <Weight className="w-4 h-4" />
                {exercise.lastWeight}kg
              </span>
              <span>{exercise.lastReps} reps</span>
              <span>{exercise.lastSets} sets</span>
            </div>
          </div>

          {/* Current Input */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Weight (kg)
              </label>
              <input
                type="number"
                value={currentWeight}
                onChange={(e) => setCurrentWeight(Number(e.target.value))}
                className="input-field"
                min="0"
                step="0.5"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reps
              </label>
              <input
                type="number"
                value={currentReps}
                onChange={(e) => setCurrentReps(Number(e.target.value))}
                className="input-field"
                min="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sets ({currentSets}/{exercise.targetSets})
              </label>
              <button
                onClick={handleSetComplete}
                disabled={currentSets >= exercise.targetSets}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Complete Set
              </button>
            </div>
            <div className="flex items-end">
              <div className="w-full">
                <p className="text-sm font-medium text-gray-700 mb-2">Progress</p>
                <div className="flex gap-1">
                  {Array.from({ length: exercise.targetSets }, (_, i) => (
                    <div
                      key={i}
                      className={`h-3 flex-1 rounded ${
                        completedSets.includes(i + 1)
                          ? 'bg-secondary-500'
                          : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
