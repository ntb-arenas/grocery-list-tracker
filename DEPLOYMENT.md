# Vercel Deployment Guide

## 🚀 Deploy to Vercel (Step-by-Step)

### Method 1: Vercel Dashboard (Recommended for Beginners)

1. **Push to GitHub**

   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/grocery-list-tracker.git
   git push -u origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Click "Import Git Repository"
   - Select your repository
   - Vercel auto-detects Next.js settings ✅

3. **Add Environment Variables**
   In the deployment configuration, add these environment variables:

   ```
   NEXT_PUBLIC_FIREBASE_API_KEY = your-api-key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = your-project-id.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID = your-project-id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = your-project-id.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = your-sender-id
   NEXT_PUBLIC_FIREBASE_APP_ID = your-app-id
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait 1-2 minutes ⏱️
   - Your app is live! 🎉

### Method 2: Vercel CLI (For Advanced Users)

1. **Install Vercel CLI**

   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**

   ```bash
   vercel login
   ```

3. **Deploy**

   ```bash
   vercel
   ```

4. **Add Environment Variables**

   ```bash
   vercel env add NEXT_PUBLIC_FIREBASE_API_KEY
   vercel env add NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
   vercel env add NEXT_PUBLIC_FIREBASE_PROJECT_ID
   vercel env add NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
   vercel env add NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
   vercel env add NEXT_PUBLIC_FIREBASE_APP_ID
   ```

5. **Redeploy with Environment Variables**
   ```bash
   vercel --prod
   ```

## 🔐 Firebase Security

Before going to production, update your Firestore security rules:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to Firestore Database > Rules
4. Update the rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /groceryItems/{item} {
      // Allow read/write for everyone (current setup)
      allow read, write: if true;

      // OR require authentication (recommended for production)
      // allow read, write: if request.auth != null;

      // OR more specific rules
      // allow read: if true;
      // allow create, update, delete: if request.auth != null;
    }
  }
}
```

## 🌐 Custom Domain (Optional)

1. Go to your Vercel project dashboard
2. Click "Settings" > "Domains"
3. Add your custom domain
4. Follow the DNS configuration instructions

## 📱 PWA Features

Once deployed, your app will automatically:

- ✅ Be installable on mobile devices
- ✅ Work offline (after first visit)
- ✅ Have app-like experience
- ✅ Show up in app drawer on mobile

To test PWA features:

1. Visit your deployed URL on mobile
2. Tap browser menu
3. Select "Add to Home Screen"
4. App icon appears on home screen! 📱

## 🔄 Auto-Deployment

Once connected to GitHub:

- Every push to `main` branch = automatic deployment
- Pull requests get preview deployments
- Rollback to any previous deployment with one click

## 🐛 Troubleshooting

**Build fails on Vercel:**

- Check that all environment variables are set
- Review build logs in Vercel dashboard
- Ensure `package.json` has all dependencies

**Firestore not working in production:**

- Verify environment variables are correct
- Check Firebase security rules
- Make sure Firestore database is created

**PWA not installing:**

- PWA only works with HTTPS (Vercel provides this)
- Check `manifest.json` is accessible at `/manifest.json`
- Verify icons exist in `/public` folder

## 📊 Monitoring

Vercel provides:

- Analytics (free tier available)
- Error tracking
- Performance metrics
- Deployment logs

Access these in your Vercel project dashboard.

## 🎉 You're Done!

Your Next.js + Firestore + PWA app is now live and ready to use!

Share your deployment URL with the world! 🌍
