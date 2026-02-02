# Grocery List Tracker

A modern, Progressive Web App (PWA) built with Next.js 14, Firestore, and Tailwind CSS. Ready for Vercel deployment.

## 🚀 Features

- ✅ **Next.js 14** with App Router and TypeScript
- ✅ **Firebase Firestore** for real-time database
- ✅ **PWA Support** - Install as a native app
- ✅ **Tailwind CSS** for beautiful, responsive UI
- ✅ **Real-time updates** - Changes sync instantly
- ✅ **Dark mode** support
- ✅ **Vercel deployment** ready

## 📋 Prerequisites

- Node.js 18+ installed
- Firebase project ([Create one here](https://console.firebase.google.com/))
- Vercel account ([Sign up here](https://vercel.com/signup))

## 🛠️ Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select an existing one
3. Go to Project Settings > General
4. Scroll down to "Your apps" and click the web icon (</>)
5. Register your app and copy the Firebase configuration
6. Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

7. Update `.env.local` with your Firebase credentials:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

### 3. Set up Firestore Database

1. In Firebase Console, go to Firestore Database
2. Click "Create database"
3. Start in **test mode** (or production mode with security rules)
4. Choose a location close to your users
5. The collection `groceryItems` will be created automatically when you add your first item

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🚢 Deployment to Vercel

### Option 1: Deploy with Vercel CLI

1. Install Vercel CLI:

```bash
npm i -g vercel
```

2. Deploy:

```bash
vercel
```

3. Add environment variables in Vercel dashboard or via CLI:

```bash
vercel env add NEXT_PUBLIC_FIREBASE_API_KEY
vercel env add NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
vercel env add NEXT_PUBLIC_FIREBASE_PROJECT_ID
vercel env add NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
vercel env add NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
vercel env add NEXT_PUBLIC_FIREBASE_APP_ID
```

### Option 2: Deploy via Vercel Dashboard

1. Push your code to GitHub/GitLab/Bitbucket
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "Import Project"
4. Select your repository
5. Add environment variables in the "Environment Variables" section
6. Click "Deploy"

## 📱 PWA Installation

Once deployed, users can install the app:

- **On Mobile**: Tap the browser menu and select "Add to Home Screen"
- **On Desktop**: Click the install icon in the address bar

## 🔒 Firebase Security Rules (Recommended)

For production, update your Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /groceryItems/{item} {
      allow read, write: if true; // Change this for production!
      // Example with authentication:
      // allow read, write: if request.auth != null;
    }
  }
}
```

## 🎨 Customization

- **Colors**: Edit `tailwind.config.ts` to change theme colors
- **App Name**: Update `manifest.json` and `app/layout.tsx`
- **Icons**: Replace files in `/public/` folder (generate icons at [realfavicongenerator.net](https://realfavicongenerator.net/))

## 📚 Tech Stack

- [Next.js 14](https://nextjs.org/) - React Framework
- [Firebase](https://firebase.google.com/) - Backend & Database
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [next-pwa](https://github.com/shadowwalker/next-pwa) - PWA Support
- [TypeScript](https://www.typescriptlang.org/) - Type Safety

## 📝 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## 🐛 Troubleshooting

**Issue**: Firestore not working

- Make sure you've created the Firestore database in Firebase Console
- Check that environment variables are correctly set
- Verify Firebase config in `.env.local`

**Issue**: PWA not installing

- PWA only works in production mode or over HTTPS
- Test with `npm run build && npm start`

**Issue**: Build errors

- Delete `node_modules` and `.next` folders
- Run `npm install` again
- Clear Next.js cache: `rm -rf .next`

## 📄 License

MIT

## 🤝 Contributing

Contributions welcome! Feel free to open issues or submit PRs.

---

**Ready to deploy?** Just push to Vercel! 🚀
