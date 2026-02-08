# 🚀 Render Deployment Guide for Lumina RAG

Deploy both frontend and backend on Render with the free tier.

---

## 🎯 Quick Deploy (Recommended)

### Step 1: Go to Render

1. Visit [render.com](https://render.com) and sign up/login
2. Click **"New +"** → **"Blueprint"**
3. Connect your GitHub account
4. Select **`Eternalcodertanishq3/lumina-rag`** repository
5. Render will detect `render.yaml` and show 2 services

### Step 2: Set Environment Variables

Before deploying, you'll be prompted to set these variables:

**Backend (lumina-rag-backend):**
| Variable | Value |
|----------|-------|
| `GEMINI_API_KEY` | Your Gemini API key |
| `SUPABASE_URL` | `https://fnezkgcwjmajzysvkoih.supabase.co` |
| `SUPABASE_KEY` | Your Supabase service role key |

**Frontend (lumina-rag-frontend):**
| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://fnezkgcwjmajzysvkoih.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key |
| `NEXT_PUBLIC_API_URL` | `https://lumina-rag-backend.onrender.com` |

### Step 3: Deploy

Click **"Apply"** and wait for both services to build and deploy.

---

## 📍 Your URLs After Deployment

| Service      | URL                                              |
| ------------ | ------------------------------------------------ |
| Frontend     | `https://lumina-rag-frontend.onrender.com`       |
| Backend      | `https://lumina-rag-backend.onrender.com`        |
| Health Check | `https://lumina-rag-backend.onrender.com/health` |

---

## ⚠️ Important: Update CORS

After getting your frontend URL, update `backend/main.py`:

```python
origins = [
    "http://localhost:3000",
    "https://lumina-rag-frontend.onrender.com",  # Add this!
    "*"
]
```

Push the change:

```bash
git add backend/main.py
git commit -m "Add Render frontend to CORS"
git push
```

Render will auto-redeploy.

---

## 🔧 Manual Deployment (Alternative)

If Blueprint doesn't work, deploy manually:

### Deploy Backend:

1. Render Dashboard → **New +** → **Web Service**
2. Connect GitHub → Select your repo
3. Configure:
   - **Name:** `lumina-rag-backend`
   - **Root Directory:** `backend`
   - **Environment:** `Python 3`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`
4. Add environment variables
5. Click **Create Web Service**

### Deploy Frontend:

1. Render Dashboard → **New +** → **Web Service**
2. Connect GitHub → Select your repo
3. Configure:
   - **Name:** `lumina-rag-frontend`
   - **Root Directory:** `frontend`
   - **Environment:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
4. Add environment variables (use backend URL from step above)
5. Click **Create Web Service**

---

## ⏰ Note on Free Tier

Render free tier has:

- **Spin down after 15 min** of inactivity
- First request after sleep takes ~30 seconds (cold start)
- 750 hours/month total

This is fine for a demo/assessment project!

---

## ✅ Verify Deployment

1. Visit your backend health check: `https://lumina-rag-backend.onrender.com/health`
2. Should return: `{"status": "ok"}`
3. Visit your frontend and test login/chat!
