# GitHub Repository Setup

Follow these steps to create and push your fitness tracker to GitHub:

## 1. Initialize Git Repository

```bash
cd my-fitness-plan
git init
git add .
git commit -m "Initial commit: My Fitness Plan web app with Next.js and Google Sheets backend"
```

## 2. Create GitHub Repository

### Option A: Using GitHub CLI (Recommended)
```bash
# Install GitHub CLI if you haven't: https://cli.github.com/
gh repo create my-fitness-plan --public --description "A modern fitness tracking web app built with Next.js and Google Sheets backend"
git remote add origin https://github.com/YOUR_USERNAME/my-fitness-plan.git
git branch -M main
git push -u origin main
```

### Option B: Using GitHub Web Interface
1. Go to [GitHub.com](https://github.com)
2. Click "New repository"
3. Repository name: `my-fitness-plan`
4. Description: `A modern fitness tracking web app built with Next.js and Google Sheets backend`
5. Make it Public
6. Don't initialize with README (we already have one)
7. Click "Create repository"
8. Follow the "push an existing repository" instructions:

```bash
git remote add origin https://github.com/YOUR_USERNAME/my-fitness-plan.git
git branch -M main
git push -u origin main
```

## 3. Set Up Deployment (Optional)

### Deploy to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Add environment variable: `NEXT_PUBLIC_SHEETS_API_URL`
4. Deploy!

### Deploy to Netlify
1. Go to [netlify.com](https://netlify.com)
2. Connect to your GitHub repository
3. Build command: `npm run build`
4. Publish directory: `out` (if using static export)
5. Add environment variables
6. Deploy!

## 4. Repository Features to Enable

### Enable GitHub Pages (for documentation)
1. Go to repository Settings
2. Scroll to "Pages"
3. Source: Deploy from a branch
4. Branch: main, folder: / (root)

### Add Repository Topics
Add these topics to help others discover your project:
- `fitness-tracker`
- `nextjs`
- `google-sheets`
- `typescript`
- `tailwindcss`
- `workout-tracker`
- `personal-records`

### Create Issues Templates
Consider adding issue templates for:
- Bug reports
- Feature requests
- Exercise additions

## 5. Future Enhancements

Consider creating branches for:
- `feature/mobile-app` - React Native version
- `feature/social-features` - Share workouts with friends
- `feature/nutrition-tracking` - Add meal logging
- `feature/ai-recommendations` - Smart workout suggestions

Your fitness tracker is now ready to help you and others achieve their fitness goals! 🎯💪






