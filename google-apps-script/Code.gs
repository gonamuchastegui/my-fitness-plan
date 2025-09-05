// Google Apps Script for Fitness Tracker Backend
// Deploy this as a Web App with execute permissions set to "Anyone"

// Sheet names - customize these to match your Google Sheets
const SHEET_NAMES = {
  EXERCISES: 'Exercises',
  PLANS: 'Plans', 
  PLAN_EXERCISES: 'PlanExercises',
  WORKOUT_LOGS: 'WorkoutLogs',
  BEST_SCORES: 'BestScores'
}

// Main entry point for web app
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents)
    const action = e.parameter.action
    
    switch(action) {
      case 'getPlans':
        return createResponse(getWorkoutPlans())
      case 'getPlan':
        return createResponse(getWorkoutPlan(data.planId))
      case 'updatePlan':
        return createResponse(updateWorkoutPlan(data.plan))
      case 'getExercises':
        return createResponse(getExercises())
      case 'getExercise':
        return createResponse(getExercise(data.exerciseId))
      case 'getPlanDetails':
        return createResponse(getPlanDetails(data.planId))
      case 'logWorkout':
        return createResponse(logWorkout(data.workoutData))
      case 'logSet':
        return createResponse(logExerciseSet(data.exerciseData))
      case 'getHistory':
        return createResponse(getWorkoutHistory(data.filters))
      case 'getExerciseHistory':
        return createResponse(getExerciseHistory(data.exerciseId))
      case 'getBestScores':
        return createResponse(getBestScores())
      case 'updateBestScore':
        return createResponse(updateBestScore(data.scoreData))
      default:
        throw new Error('Invalid action: ' + action)
    }
  } catch (error) {
    return createResponse({ error: error.toString() }, 400)
  }
}

function createResponse(data, statusCode = 200) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON)
}

// Get the active spreadsheet
function getSpreadsheet() {
  return SpreadsheetApp.getActiveSpreadsheet()
}

function getSheet(sheetName) {
  const ss = getSpreadsheet()
  let sheet = ss.getSheetByName(sheetName)
  
  if (!sheet) {
    sheet = ss.insertSheet(sheetName)
    initializeSheet(sheet, sheetName)
  }
  
  return sheet
}

// Initialize sheet headers based on sheet type
function initializeSheet(sheet, sheetName) {
  switch(sheetName) {
    case SHEET_NAMES.EXERCISES:
      sheet.getRange(1, 1, 1, 5).setValues([['ID', 'Name', 'Category', 'ImageURL', 'Instructions']])
      break
    case SHEET_NAMES.PLANS:
      sheet.getRange(1, 1, 1, 5).setValues([['ID', 'Name', 'Description', 'Frequency', 'IsActive']])
      break
    case SHEET_NAMES.PLAN_EXERCISES:
      sheet.getRange(1, 1, 1, 6).setValues([['PlanID', 'ExerciseID', 'TargetSets', 'TargetReps', 'RestTime', 'Order']])
      break
    case SHEET_NAMES.WORKOUT_LOGS:
      sheet.getRange(1, 1, 1, 8).setValues([['ID', 'Date', 'ExerciseID', 'ExerciseName', 'Weight', 'Reps', 'Sets', 'PlanName']])
      break
    case SHEET_NAMES.BEST_SCORES:
      sheet.getRange(1, 1, 1, 6).setValues([['ExerciseID', 'ExerciseName', 'BestWeight', 'BestReps', 'AchievedDate', 'Category']])
      break

  }
}

// Workout Plans
function getWorkoutPlans() {
  const plansSheet = getSheet(SHEET_NAMES.PLANS)
  const planExercisesSheet = getSheet(SHEET_NAMES.PLAN_EXERCISES)
  
  const plansData = plansSheet.getDataRange().getValues()
  const planExercisesData = planExercisesSheet.getDataRange().getValues()
  
  const plans = []
  
  for (let i = 1; i < plansData.length; i++) {
    const [id, name, description, frequency, isActive] = plansData[i]
    
    const exercises = planExercisesData
      .filter(row => row[0] === id)
      .map(row => ({
        exerciseId: row[1],
        targetSets: row[2],
        targetReps: row[3],
        restTime: row[4]
      }))
    
    plans.push({
      id,
      name,
      description,
      frequency,
      isActive,
      exercises
    })
  }
  
  return plans
}

function getWorkoutPlan(planId) {
  const plans = getWorkoutPlans()
  return plans.find(plan => plan.id === planId)
}

// Exercises
function getExercises() {
  const sheet = getSheet(SHEET_NAMES.EXERCISES)
  const data = sheet.getDataRange().getValues()
  
  const exercises = []
  for (let i = 1; i < data.length; i++) {
    const [id, name, category, imageUrl, instructions] = data[i]
    exercises.push({ id, name, category, imageUrl, instructions })
  }
  
  return exercises
}

function getExercise(exerciseId) {
  const exercises = getExercises()
  return exercises.find(ex => ex.id === exerciseId)
}

// Get Plan Details (replaces getTodayWorkout)
function getPlanDetails(planId) {
  const plan = getWorkoutPlan(planId)
  if (!plan) {
    throw new Error('Plan not found')
  }
  
  const exercises = getExercises()
  const workoutLogs = getWorkoutHistory({ limit: 100 })
  
  const planExercises = plan.exercises.map(planEx => {
    const exercise = exercises.find(ex => ex.id === planEx.exerciseId)
    const lastLog = workoutLogs
      .filter(log => log.exerciseId === planEx.exerciseId)
      .sort((a, b) => new Date(b.date) - new Date(a.date))[0]
    
    return {
      id: exercise.id,
      name: exercise.name,
      imageUrl: exercise.imageUrl || '',
      lastWeight: lastLog ? lastLog.weight : 0,
      lastReps: lastLog ? lastLog.reps : 8,
      lastSets: lastLog ? lastLog.sets : 0,
      targetSets: planEx.targetSets,
      targetReps: planEx.targetReps,
      restTime: planEx.restTime
    }
  })
  
  return {
    planName: plan.name,
    exercises: planExercises
  }
}

// Workout Logging
function logWorkout(workoutData) {
  const sheet = getSheet(SHEET_NAMES.WORKOUT_LOGS)
  
  workoutData.exercises.forEach(exercise => {
    const id = Utilities.getUuid()
    const row = [
      id,
      workoutData.date,
      exercise.exerciseId,
      exercise.exerciseName,
      exercise.weight,
      exercise.reps,
      exercise.sets,
      workoutData.planName
    ]
    sheet.appendRow(row)
    
    // Check and update best scores
    checkAndUpdateBestScore(exercise.exerciseId, exercise.exerciseName, exercise.weight, exercise.reps, workoutData.date)
  })
  
  return { success: true }
}

function logExerciseSet(exerciseData) {
  const sheet = getSheet(SHEET_NAMES.WORKOUT_LOGS)
  const id = Utilities.getUuid()
  
  const row = [
    id,
    exerciseData.date,
    exerciseData.exerciseId,
    exerciseData.exerciseName,
    exerciseData.weight,
    exerciseData.reps,
    1, // sets = 1 for individual set logging
    exerciseData.planName
  ]
  
  sheet.appendRow(row)
  
  // Check and update best scores
  checkAndUpdateBestScore(exerciseData.exerciseId, exerciseData.exerciseName, exerciseData.weight, exerciseData.reps, exerciseData.date)
  
  return { success: true }
}

// History
function getWorkoutHistory(filters = {}) {
  const sheet = getSheet(SHEET_NAMES.WORKOUT_LOGS)
  const data = sheet.getDataRange().getValues()
  
  let logs = []
  for (let i = 1; i < data.length; i++) {
    const [id, date, exerciseId, exerciseName, weight, reps, sets, planName] = data[i]
    logs.push({
      id,
      date: date, // ✅ Usar la fecha tal como está, sin reformatear
      exerciseId,
      exerciseName,
      weight,
      reps,
      sets,
      planName
    })
  }
  
  // Apply filters
  if (filters.exerciseId) {
    logs = logs.filter(log => log.exerciseId === filters.exerciseId)
  }
  
  if (filters.startDate) {
    logs = logs.filter(log => log.date >= filters.startDate)
  }
  
  if (filters.endDate) {
    logs = logs.filter(log => log.date <= filters.endDate)
  }
  
  // Sort by date descending
  logs.sort((a, b) => new Date(b.date) - new Date(a.date))
  
  if (filters.limit) {
    logs = logs.slice(0, filters.limit)
  }
  
  return logs
}

function getExerciseHistory(exerciseId) {
  return getWorkoutHistory({ exerciseId })
}

// Best Scores
function getBestScores() {
  const sheet = getSheet(SHEET_NAMES.BEST_SCORES)
  const data = sheet.getDataRange().getValues()
  
  const scores = []
  for (let i = 1; i < data.length; i++) {
    const [exerciseId, exerciseName, bestWeight, bestReps, achievedDate, category] = data[i]
    scores.push({
      exerciseId,
      exerciseName,
      bestWeight,
      bestReps,
      achievedDate: Utilities.formatDate(new Date(achievedDate), Session.getScriptTimeZone(), 'yyyy-MM-dd'),
      category
    })
  }
  
  return scores
}

function checkAndUpdateBestScore(exerciseId, exerciseName, weight, reps, date) {
  const sheet = getSheet(SHEET_NAMES.BEST_SCORES)
  const data = sheet.getDataRange().getValues()
  
  // Calculate current 1RM estimate
  const currentMax = weight * (1 + reps / 30)
  
  let bestScoreRowIndex = -1
  let currentBestMax = 0
  
  // Find existing best score
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === exerciseId) {
      bestScoreRowIndex = i + 1 // +1 for 1-based indexing
      const bestWeight = data[i][2]
      const bestReps = data[i][3]
      currentBestMax = bestWeight * (1 + bestReps / 30)
      break
    }
  }
  
  // Update if new record
  if (currentMax > currentBestMax) {
    const exercise = getExercise(exerciseId)
    const category = exercise ? exercise.category : 'Unknown'
    
    if (bestScoreRowIndex > 0) {
      // Update existing record
      sheet.getRange(bestScoreRowIndex, 1, 1, 6).setValues([[
        exerciseId, exerciseName, weight, reps, new Date(date), category
      ]])
    } else {
      // Add new record
      sheet.appendRow([exerciseId, exerciseName, weight, reps, new Date(date), category])
    }
  }
}

function updateBestScore(scoreData) {
  checkAndUpdateBestScore(
    scoreData.exerciseId,
    scoreData.exerciseName,
    scoreData.weight,
    scoreData.reps,
    scoreData.date
  )
  return { success: true }
}
