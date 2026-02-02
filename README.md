# Grocery List Tracker

A modern PWA built with Next.js 14, Firestore, and Tailwind CSS. Ready for Vercel deployment.

## 🚀 Features

- Next.js 14 (App Router, TypeScript)
- Firebase Firestore (real-time database)
- PWA support
- Tailwind CSS
- Dark mode
- Vercel deploy ready

## 📋 Prerequisites

- Node.js 18+
- Firebase project ([Create one](https://console.firebase.google.com/))
- Vercel account ([Sign up](https://vercel.com/signup))

## 🛠️ Quick Setup

1. **Install dependencies**
   ```bash
   npm install
   ```
2. **Add Firebase credentials**
   - Create a `.env.local` file in the project root:
     ```env
     NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
     NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
     NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
     NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
     NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
     NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
     ```
3. **Set up Firestore**
   - In Firebase Console, go to Firestore Database
   - Click "Create database" and start in test mode
   - The `groceryItems` collection will be created automatically
4. **Run the app**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🚢 Deploy to Vercel

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```
2. Deploy:
   ```bash
   vercel
   ```
3. Add environment variables in Vercel dashboard or via CLI

Or use the Vercel Dashboard to import your repo and add env vars.

## 📱 PWA Installation

- On mobile: Add to Home Screen from browser menu
- On desktop: Click install icon in address bar


## 📝 Scripts

- `npm run dev` - Start dev server
- `npm run build` - Build for production

## 📱 PWA Installation

Once deployed, users can install the app:

- **On Mobile**: Tap the browser menu and select "Add to Home Screen"
- **On Desktop**: Click the install icon in the address bar

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

**Ready to deploy?** Just push to Vercel! 🚀
