# 🚀 Railway Deployment Guide for Lumina RAG

This guide walks you through deploying both the frontend and backend on Railway.

## Prerequisites

1. **GitHub Account** - Push your code to GitHub first
2. **Railway Account** - Sign up at [railway.app](https://railway.app) (free tier available)
3. **Your Environment Variables** ready

---

## Step 1: Push Code to GitHub

```bash
# Initialize git if not already done
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Lumina RAG"

# Add your GitHub repo as remote
git remote add origin https://github.com/YOUR_USERNAME/lumina-rag.git

# Push
git push -u origin main
```

---

## Step 2: Create Railway Project

1. Go to [railway.app](https://railway.app) and log in
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Connect your GitHub account if not already connected
5. Select your **lumina-rag** repository

---

## Step 3: Deploy Backend Service

### 3.1 Create Backend Service

1. In your Railway project, click **"+ New Service"**
2. Select **"GitHub Repo"** → Select your repo
3. Railway will auto-detect Python

### 3.2 Configure Backend

1. Click on the backend service
2. Go to **"Settings"** tab
3. Set **Root Directory**: `backend`
4. Set **Start Command**: `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`

### 3.3 Set Environment Variables

Go to **"Variables"** tab and add:

| Variable         | Value                                      |
| ---------------- | ------------------------------------------ |
| `GEMINI_API_KEY` | Your Gemini API key                        |
| `SUPABASE_URL`   | `https://fnezkgcwjmajzysvkoih.supabase.co` |
| `SUPABASE_KEY`   | Your Supabase service role key             |

### 3.4 Generate Domain

1. Go to **"Settings"** → **"Networking"**
2. Click **"Generate Domain"**
3. Copy the URL (e.g., `lumina-backend.railway.app`)

---

## Step 4: Deploy Frontend Service

### 4.1 Create Frontend Service

1. Click **"+ New Service"** again
2. Select **"GitHub Repo"** → Same repo
3. Railway will auto-detect Node.js

### 4.2 Configure Frontend

1. Click on the frontend service
2. Go to **"Settings"** tab
3. Set **Root Directory**: `frontend`
4. Set **Build Command**: `npm install && npm run build`
5. Set **Start Command**: `npm start`

### 4.3 Set Environment Variables

Go to **"Variables"** tab and add:

| Variable                        | Value                                                                  |
| ------------------------------- | ---------------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | `https://fnezkgcwjmajzysvkoih.supabase.co`                             |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key                                                 |
| `NEXT_PUBLIC_API_URL`           | Backend URL from Step 3.4 (e.g., `https://lumina-backend.railway.app`) |

### 4.4 Generate Domain

1. Go to **"Settings"** → **"Networking"**
2. Click **"Generate Domain"**
3. This is your live frontend URL!

---

## Step 5: Update CORS (Important!)

After getting your frontend URL, update the backend CORS settings:

In `backend/main.py`, update the origins list:

```python
origins = [
    "http://localhost:3000",
    "https://your-frontend.railway.app",  # Add your Railway frontend URL
    "*"
]
```

Push the change and Railway will auto-redeploy.

---

## Step 6: Verify Deployment

1. Visit your frontend URL
2. Log in or sign up
3. Try ingesting some text
4. Ask a question!

---

## Troubleshooting

### Backend not starting?

- Check logs in Railway dashboard
- Verify all environment variables are set
- Make sure `requirements.txt` has all dependencies

### Frontend can't connect to backend?

- Check `NEXT_PUBLIC_API_URL` is correct
- Ensure CORS includes your frontend domain
- Verify backend is running (check `/health` endpoint)

### Database errors?

- Verify Supabase credentials
- Check if RLS policies are correct
- Ensure tables exist (run schema SQL)

---

## Cost Estimate

Railway Free Tier includes:

- **500 hours/month** of usage
- **1 GB RAM** per service
- **1 GB disk** storage

For a demo app, this should be plenty!

---

## Quick Reference

| Service      | URL Pattern                               |
| ------------ | ----------------------------------------- |
| Backend      | `https://your-backend.railway.app`        |
| Frontend     | `https://your-frontend.railway.app`       |
| Health Check | `https://your-backend.railway.app/health` |
