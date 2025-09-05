# My Fitness Plan - Setup Guide

This guide will help you set up the fitness tracking web app with Google Sheets as the backend.

## Prerequisites

- Node.js 18+ installed
- A Google account
- Basic familiarity with Google Sheets and Apps Script

## Quick Start

### 1. Clone and Install Dependencies

```bash
cd my-fitness-plan
npm install
```

### 2. Set Up Google Sheets Backend

#### Step 1: Create Your Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet
3. Rename it to "My Fitness Tracker" (or your preferred name)
4. The Apps Script will automatically create the necessary sheets when first run

#### Step 2: Set Up Google Apps Script

1. In your Google Sheet, go to `Extensions > Apps Script`
2. Delete the default `Code.gs` content
3. Copy the entire content from `/google-apps-script/Code.gs` in this project
4. Paste it into the Apps Script editor
5. Save the project (Ctrl+S or Cmd+S)

#### Step 3: Deploy as Web App

1. In Apps Script, click `Deploy > New deployment`
2. Choose type: `Web app`
3. Set the following:
   - **Execute as**: Me (your email)
   - **Who has access**: Anyone
4. Click `Deploy`
5. Copy the Web App URL (it looks like: `https://script.google.com/macros/s/SCRIPT_ID/exec`)

#### Step 4: Configure Environment

1. Copy `env.example` to `.env.local`
2. Replace `YOUR_SCRIPT_ID` with your actual script ID from the Web App URL
3. Save the file

```bash
cp env.example .env.local
# Edit .env.local with your actual values
```

### 3. Set Up Sample Data (Optional)

Add some sample data to your Google Sheets to test the app:

#### Exercises Sheet
| ID | Name | Category | ImageURL | Instructions |
|----|------|----------|----------|--------------|
| 1 | Bench Press | Upper Body | https://example.com/bench.jpg | Lie on bench, press weight up |
| 2 | Squats | Lower Body | https://example.com/squat.jpg | Stand with feet apart, squat down |
| 3 | Deadlift | Lower Body | https://example.com/deadlift.jpg | Lift weight from ground to standing |

#### Plans Sheet
| ID | Name | Description | Frequency | IsActive |
|----|------|-------------|-----------|----------|
| 1 | Push Day | Upper body pushing exercises | 2x per week | TRUE |
| 2 | Pull Day | Upper body pulling exercises | 2x per week | TRUE |
| 3 | Leg Day | Lower body exercises | 2x per week | TRUE |

#### PlanExercises Sheet
| PlanID | ExerciseID | TargetSets | TargetReps | RestTime | Order |
|--------|------------|------------|------------|----------|-------|
| 1 | 1 | 3 | 8-10 | 180 | 1 |
| 2 | 3 | 3 | 5-6 | 240 | 1 |
| 3 | 2 | 3 | 10-12 | 120 | 1 |

#### Schedule Sheet
| Date | PlanID | PlanName |
|------|--------|----------|
| 2024-01-15 | 1 | Push Day |
| 2024-01-16 | 2 | Pull Day |
| 2024-01-17 | 3 | Leg Day |

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Customization

### Adding New Exercises

1. Open your Google Sheet
2. Go to the "Exercises" tab
3. Add a new row with:
   - **ID**: Unique identifier (e.g., "4")
   - **Name**: Exercise name (e.g., "Pull-ups")
   - **Category**: "Upper Body", "Lower Body", or "Cardio"
   - **ImageURL**: Link to exercise image/GIF
   - **Instructions**: Brief description

### Creating New Workout Plans

1. Add the plan to the "Plans" sheet
2. Add exercises to the "PlanExercises" sheet
3. Schedule workouts in the "Schedule" sheet

### Modifying the UI

The app uses Tailwind CSS for styling. Key files to modify:
- `/app/globals.css` - Global styles and custom components
- `/tailwind.config.ts` - Tailwind configuration
- Individual page components in `/app/` and `/components/`

## Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Connect your GitHub repo to [Vercel](https://vercel.com)
3. Add your environment variables in Vercel dashboard
4. Deploy!

### Deploy to Netlify

1. Build the app: `npm run build`
2. Deploy the `out` folder to [Netlify](https://netlify.com)
3. Set environment variables in Netlify dashboard

## Troubleshooting

### Common Issues

**Apps Script Permission Error**
- Make sure the Web App is deployed with "Anyone" access
- Check that the execution is set to run as your account

**Data Not Loading**
- Verify the Apps Script URL in your `.env.local`
- Check the browser console for API errors
- Ensure your Google Sheets has the correct sheet names and headers

**CORS Errors**
- This shouldn't happen with Apps Script, but if it does, the issue is likely with the deployment settings

### Getting Help

1. Check the browser console for error messages
2. Test your Apps Script directly in the Apps Script editor
3. Verify your Google Sheets data structure matches the expected format

## Features Overview

- **Plan for the Day**: View and log today's scheduled workout
- **My Plans**: Manage different workout routines
- **Exercise History**: Track progress over time with charts
- **Best Scores**: Monitor personal records and achievements

## Security Notes

- The Apps Script runs with your Google account permissions
- Only you can modify the underlying Google Sheets
- The web app can be accessed by anyone with the URL, but they can't modify your data directly
- Consider adding authentication if you want to restrict access

## Next Steps

- Add more exercises to your database
- Create custom workout plans
- Start logging your workouts
- Monitor your progress over time!

Enjoy tracking your fitness journey! 💪
