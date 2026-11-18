# AstraWish

Genshin Impact Primogem and Intertwined Fate savings planner.

## Files
- `index.html` (page), `style.css` (design), `app.js` (logic and Firebase config)
- `assets/` (backgrounds, icons, character and navigation images)
- `firebase.json` (only needed if you use Firebase Hosting)

## Firebase sign-in (already configured)
The Firebase project config (`astrawish`) is already set in `app.js` (`FIREBASE_CONFIG`).
Do these once in the Firebase Console:
1. Authentication > Sign-in method: turn on **Email/Password** and **Google**.
2. Authentication > Settings > Authorized domains: add the domain of your site, for example `astrawish.vercel.app` (no https://).
3. Build > **Firestore Database** > Create database (production mode, any region near you).
4. Firestore > **Rules** tab: replace everything with the rules below, then **Publish**:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
  }
}
```
Signed-in data (savings, history, goal, fates, streak, owned characters, quests, name) is saved to Firestore at `users/{uid}`, so it is the same on every device. Guest data stays on the device only. Each user can only read and write their own document.

## Deploy on Vercel
1. Put all files in the root of a GitHub repo (`assets/` stays a folder). GitHub web upload takes up to 100 files at a time, so upload `assets/` in batches.
2. vercel.com > Add New > Project > pick the repo.
3. Framework Preset: **Other**. Leave Build Command and Output Directory empty. Deploy.
No GitHub? In this folder run `npx vercel`, then `npx vercel --prod`.

## Characters
Character images are `assets/<name in lowercase>.png`, with spaces kept (example: `hu tao.png`).

Until Firebase is enabled and the domain is authorized, sign-in will not work. Opening `index.html` as a plain file also will not work for login; use the deployed link or localhost.
