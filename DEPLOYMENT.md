# Deployment Guide - Render with Vercel Services

This guide shows how to deploy your app to Render while continuing to use Vercel Blob Storage and Analytics.

## Why Deploy to Render?

- **Vercel doesn't support WebSockets** (needed for Socket.io real-time chat)
- **Render supports long-running Node.js processes** (perfect for Socket.io)
- **You can still use Vercel services** (Blob Storage, Analytics) from Render

## Prerequisites

1. GitHub account with your code pushed
2. Vercel account (for Blob Storage)
3. Render account (free tier available)

## Step 1: Get Vercel Blob Token

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Navigate to **Storage** → **Blob** (or create a new Blob store if you don't have one)
3. Click on your Blob store
4. Go to **Settings** → **Tokens**
5. Create a new token or copy your existing `BLOB_READ_WRITE_TOKEN`
6. Save this token - you'll need it for Render

## Step 2: Deploy to Render

### 2.1 Create Web Service

1. Go to [Render Dashboard](https://render.com/dashboard)
2. Click **New** → **Web Service**
3. Connect your GitHub repository
4. Select your `song-for-glaze` repository

### 2.2 Configure Service

Fill in the following settings:

**Basic Settings:**
- **Name**: `song-for-glaze` (or your preferred name)
- **Region**: Choose closest to your users
- **Branch**: `main` (or your default branch)
- **Root Directory**: Leave blank
- **Runtime**: `Node`

**Build Settings:**
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`

**Instance Type:**
- Select **Free** tier (or paid if you need more resources)

### 2.3 Add Environment Variables

Click **Advanced** → **Add Environment Variable** and add these:

| Key | Value | Notes |
|-----|-------|-------|
| `NODE_ENV` | `production` | Required |
| `PORT` | `3000` | Render auto-detects, but good to set |
| `HOSTNAME` | `0.0.0.0` | Required for Render |
| `BLOB_READ_WRITE_TOKEN` | `vercel_blob_***` | From Vercel Blob dashboard |
| `CORS_ORIGIN` | `*` | Or set to your domain for security |
| `NEXT_PUBLIC_VERCEL_ANALYTICS_ID` | (optional) | If you want analytics |

**Important:**
- Get `BLOB_READ_WRITE_TOKEN` from Vercel Dashboard → Storage → Blob → Settings → Tokens
- This allows Render to read/write to your Vercel Blob storage

### 2.4 Deploy

1. Click **Create Web Service**
2. Render will automatically:
   - Clone your repository
   - Install dependencies
   - Build your Next.js app
   - Start the server with Socket.io

3. Wait for deployment to complete (usually 3-5 minutes)
4. Your app will be available at: `https://song-for-glaze.onrender.com` (or your chosen name)

## Step 3: Verify Everything Works

### Test Real-time Chat
1. Open your Render URL
2. Click "Real-Time Chat"
3. Open two browser windows
4. Select Player 1 in one window, Player 2 in another
5. Send messages - they should appear in real-time!
6. Test `/action` commands

### Test Vercel Blob Storage
1. Go to Affirmations page
2. Submit a message
3. Check Vercel Dashboard → Storage → Blob
4. You should see `affirmations.json` file updated

### Test Analytics (if configured)
- Vercel Analytics will track pageviews even on Render
- View analytics in Vercel Dashboard → Analytics

## Step 4: Custom Domain (Optional)

### On Render:
1. Go to your service settings
2. Click **Custom Domain**
3. Add your domain (e.g., `chat.yourdomain.com`)
4. Follow DNS instructions

### Update Environment Variables:
- Set `CORS_ORIGIN` to your custom domain: `https://chat.yourdomain.com`

## Architecture Overview

```
┌─────────────────────────────────────────────────┐
│                                                 │
│  Users → https://song-for-glaze.onrender.com   │
│                                                 │
└────────────────┬────────────────────────────────┘
                 │
                 ├─── Socket.io (Render) ───────────► Real-time Chat
                 │
                 ├─── Vercel Blob API ──────────────► Affirmations Storage
                 │
                 └─── Vercel Analytics ─────────────► Usage Tracking
```

## Troubleshooting

### Chat Not Connecting
- Check Render logs: Dashboard → Your Service → Logs
- Verify Socket.io is running: Look for "Client connected" messages
- Check browser console for connection errors

### Blob Storage Errors
- Verify `BLOB_READ_WRITE_TOKEN` is set correctly in Render
- Check token permissions in Vercel dashboard
- Review Render logs for specific error messages

### Build Failures
- Check that all dependencies are in `package.json`
- Verify Node.js version compatibility
- Review build logs in Render dashboard

## Cost Breakdown

- **Render Free Tier**:
  - 750 hours/month (enough for 1 service running 24/7)
  - Sleeps after 15 min of inactivity (wakes on request)
  - Perfect for testing/personal projects

- **Vercel Blob Free Tier**:
  - 500 MB storage
  - 1 GB bandwidth/month
  - More than enough for affirmations data

- **Vercel Analytics Free Tier**:
  - 2,500 events/month
  - Basic analytics

## Upgrading

If your app grows and you need:
- **No sleep on inactivity**: Upgrade Render to Starter plan ($7/month)
- **More Blob storage**: Upgrade Vercel Blob plan
- **More analytics**: Upgrade Vercel Analytics plan

## Alternative: Deploy Everything to Railway

If you want to move away from Vercel entirely:

1. Replace Vercel Blob with:
   - **File system storage** (simple, free)
   - **MongoDB Atlas** (free tier, 512MB)
   - **PostgreSQL** (Railway provides free tier)

2. Replace Vercel Analytics with:
   - **Google Analytics** (free)
   - **Plausible** (privacy-focused)
   - **Umami** (self-hosted)

## Support

- **Render Docs**: https://docs.render.com/
- **Vercel Blob Docs**: https://vercel.com/docs/storage/vercel-blob
- **Socket.io Docs**: https://socket.io/docs/

## Summary

✅ **What works on Render:**
- Real-time WebSocket chat with Socket.io
- All Next.js app features
- Vercel Blob Storage (via API)
- Vercel Analytics

✅ **Benefits:**
- Free tier available
- Automatic deployments from GitHub
- HTTPS included
- No cold starts on paid tier
- Full Node.js support

🚀 Your app is now deployed with the best of both platforms!
