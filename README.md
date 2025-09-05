# My Fitness Plan

Una aplicación de fitness simplificada que te permite elegir rutinas de entrenamiento y hacer seguimiento de tu progreso.

## Características

- **Vista Unificada**: My Plans y History en una sola página principal
- **Selección de Rutinas**: Elige qué rutina quieres hacer desde la vista principal
- **Seguimiento de Progreso**: Ve tu historial de entrenamientos ordenado por última actividad
- **Mejores Marcas**: Visualiza tus mejores pesos y repeticiones para cada ejercicio
- **Sin Programación**: Tú decides cuándo hacer cada rutina

## Flujo de la Aplicación

1. **Vista Principal**: Muestra tus planes activos y el historial reciente
2. **Selección de Rutina**: Haz clic en "Start Workout" para comenzar una rutina
3. **Vista de Entrenamiento**: Ejecuta los ejercicios de la rutina seleccionada
4. **Completar Entrenamiento**: Guarda tu progreso y vuelve a la vista principal

## Estructura del Proyecto

```
my-fitness-plan/
├── app/
│   ├── page.tsx          # Página principal unificada
│   ├── layout.tsx        # Layout de la aplicación
│   └── globals.css       # Estilos globales
├── components/
│   ├── Navigation.tsx    # Navegación simplificada
│   └── ExerciseCard.tsx  # Tarjeta de ejercicio
├── lib/
│   └── sheets.ts         # API de Google Sheets
└── google-apps-script/
    └── Code.gs           # Backend en Google Apps Script
```

## Configuración

### 1. Google Sheets

Crea una hoja de cálculo con las siguientes hojas:
- **Exercises**: ID, Name, Category, ImageURL, Instructions
- **Plans**: ID, Name, Description, Frequency, IsActive
- **PlanExercises**: PlanID, ExerciseID, TargetSets, TargetReps, RestTime, Order
- **WorkoutLogs**: ID, Date, ExerciseID, ExerciseName, Weight, Reps, Sets, PlanName
- **BestScores**: ExerciseID, ExerciseName, BestWeight, BestReps, AchievedDate, Category

### 2. Google Apps Script

1. Ve a [script.google.com](https://script.google.com)
2. Crea un nuevo proyecto
3. Copia el contenido de `google-apps-script/Code.gs`
4. Despliega como aplicación web con permisos de ejecución para "Anyone"

### 3. Variables de Entorno

Crea un archivo `.env.local`:
```env
NEXT_PUBLIC_SHEETS_API_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
```

## Uso

1. **Ver Planes**: En la vista principal verás todos tus planes activos
2. **Iniciar Entrenamiento**: Haz clic en "Start Workout" en el plan que quieras hacer
3. **Completar Ejercicios**: Marca cada set como completado
4. **Finalizar Entrenamiento**: Haz clic en "Complete Workout" para guardar
5. **Ver Progreso**: El historial se actualiza automáticamente

## Tecnologías

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Google Apps Script
- **Base de Datos**: Google Sheets
- **Estado**: React Hooks (useState, useEffect)

## Cambios Recientes

- ✅ Eliminada la vista de "Best Scores"
- ✅ Unificadas "My Plans" y "History" en una sola vista
- ✅ Eliminado "Plan for Today" 
- ✅ Eliminados botones sin función (Swap, Save Progress)
- ✅ Eliminada la funcionalidad de programación automática
- ✅ Flujo simplificado: seleccionar rutina → hacer entrenamiento → guardar progreso

## Desarrollo

```bash
npm install
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`