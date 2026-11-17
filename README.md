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
No Firestore or Database rules are needed. Savings data is stored on the device.

## Deploy on Vercel
1. Put all files in the root of a GitHub repo (`assets/` stays a folder). GitHub web upload takes up to 100 files at a time, so upload `assets/` in batches.
2. vercel.com > Add New > Project > pick the repo.
3. Framework Preset: **Other**. Leave Build Command and Output Directory empty. Deploy.
No GitHub? In this folder run `npx vercel`, then `npx vercel --prod`.

## Characters
Character images are `assets/<name in lowercase>.png`, with spaces kept (example: `hu tao.png`).

Until Firebase is enabled and the domain is authorized, sign-in will not work. Opening `index.html` as a plain file also will not work for login; use the deployed link or localhost.
