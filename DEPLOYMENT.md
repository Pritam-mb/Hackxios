# EcoSync Vercel Deployment Guide

## Prerequisites
- Vercel account (sign up at https://vercel.com)
- Vercel CLI installed: `npm install -g vercel`
- GitHub repository connected to Vercel

## Deployment Steps

### 1. Install Vercel CLI (if not already installed)
```bash
npm install -g vercel
```

### 2. Login to Vercel
```bash
vercel login
```

### 3. Deploy from Root Directory
```bash
vercel
```

Follow the prompts:
- Set up and deploy? **Y**
- Which scope? Select your account
- Link to existing project? **N** (first time) or **Y** (if already created)
- What's your project's name? **ecosync** (or your preferred name)
- In which directory is your code located? **./** (root)

### 4. Configure Environment Variables on Vercel

Go to your Vercel project dashboard → Settings → Environment Variables

Add the following variables:

#### Backend Variables:
- `MONGODB_URI` = `mongodb+srv://ecosync_admin:Pritam21@cluster0.5bfwrwi.mongodb.net/ecosync?retryWrites=true&w=majority`
- `JWT_SECRET` = `ahjusioep*ehs78wwhq41@dwgwojl56dhswv`
- `GEMINI_API_KEY` = `AIzaSyCEjsxpizIOb_spfED0aCTpaaw1jMW4OA0`
- `PORT` = `5000`

#### Frontend Variables:
- `VITE_API_BASE_URL` = `https://your-vercel-app.vercel.app/api`

**Important:** Replace `your-vercel-app` with your actual Vercel deployment URL.

### 5. Update Frontend Environment Variable

After first deployment, you'll get a Vercel URL. Update the frontend .env:

```bash
# ecosyc/ecosync-app/.env
VITE_API_BASE_URL=https://your-actual-vercel-url.vercel.app/api
```

Then redeploy:
```bash
vercel --prod
```

### 6. Deploy to Production
```bash
vercel --prod
```

## Project Structure

```
hackxios/
├── ecosyc/
│   ├── ecosync-app/          # React Frontend (Vite)
│   │   ├── src/
│   │   ├── dist/             # Build output
│   │   └── package.json
│   └── ecosync-backend/      # Node.js Backend (Express)
│       ├── controllers/
│       ├── models/
│       ├── routes/
│       ├── services/
│       └── server.js
├── vercel.json               # Vercel configuration
└── package.json
```

## Vercel Configuration Explained

The `vercel.json` file configures:
- **Backend**: Deployed as serverless function at `/api/*`
- **Frontend**: Built and served as static files

## Troubleshooting

### Issue: API calls failing
**Solution**: Ensure `VITE_API_BASE_URL` in frontend .env matches your Vercel deployment URL

### Issue: Environment variables not working
**Solution**: 
1. Check they're added in Vercel dashboard
2. Redeploy after adding variables
3. For frontend vars, they must start with `VITE_`

### Issue: Build fails
**Solution**: 
1. Check build logs in Vercel dashboard
2. Ensure all dependencies are in package.json
3. Run `npm install` locally to verify

### Issue: MongoDB connection fails
**Solution**: 
1. Verify MongoDB Atlas allows connections from anywhere (0.0.0.0/0)
2. Check MongoDB URI is correct in Vercel environment variables

## Continuous Deployment

Once connected to GitHub:
1. Push changes to main branch
2. Vercel automatically deploys
3. Preview deployments for pull requests

## Custom Domain (Optional)

1. Go to Vercel project → Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Update `VITE_API_BASE_URL` to use custom domain

## Monitoring

- View logs: Vercel Dashboard → Your Project → Logs
- Monitor performance: Vercel Dashboard → Analytics
- Check deployments: Vercel Dashboard → Deployments

## Important Notes

- Backend runs as serverless functions (cold starts may occur)
- Frontend is served as static files (fast CDN delivery)
- Environment variables are encrypted and secure
- Free tier has usage limits (check Vercel pricing)

## Support

For issues:
1. Check Vercel deployment logs
2. Review browser console for frontend errors
3. Check Network tab for API call failures
4. Verify all environment variables are set correctly
