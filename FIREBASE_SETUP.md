# Firebase Setup For Policy Compass

## 1. Create the Firebase project
- Open Firebase Console.
- Create a project for `1Peace`.
- Add a Web App.

## 2. Enable Google sign-in
- Go to `Authentication`.
- Open `Sign-in method`.
- Enable `Google`.
- Add your support email when Firebase asks for it.

## 3. Configure authorized domains
- Open `Authentication`.
- Go to the `Settings` tab.
- Under `Authorized domains`, make sure these are present:
  - `localhost`
  - `127.0.0.1`
  - `peace-2c6e2.firebaseapp.com`
  - `peace-2c6e2.web.app`
  - your custom domain too, if you deploy one later
- If your Vite dev server uses a custom hostname, add that exact hostname as well.
- The quick path is:
  - `Firebase Console` -> `Authentication` -> `Settings` -> `Authorized domains` -> `Add domain`
- After adding a domain, wait a minute and test again because popup auth sometimes lags briefly.

## 4. Enable Firestore
- Go to `Firestore Database`.
- Create a database.
- Use production mode or test mode for hackathon development.

## 5. Add frontend environment variables
Create a local `.env.local` file and fill in:

```env
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id_optional
```

## 5.1 Firebase Hosting SPA rewrite
If Google sign-in returns to a white page on a deployed route like `/policy-brain`, Firebase Hosting usually needs a single-page app rewrite.

This repo now includes:
- [firebase.json](/c:/Users/qxnqi/1Peace/firebase.json)
- [.firebaserc](/c:/Users/qxnqi/1Peace/.firebaserc)

They ensure all routes rewrite to `index.html` after deployment.

Deploy flow:
- `npm run build`
- `firebase deploy --only hosting`

## 6. Firestore rules for hackathon v1
Use rules that let authenticated users read and write only their own profile subtree:

```txt
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

You can paste the same rules from [firestore.rules](/c:/Users/qxnqi/1Peace/firestore.rules).

Console path:
- `Firebase Console` -> `Firestore Database` -> `Rules`
- Replace the default rules with the snippet above
- Click `Publish`

## 7. Stored profile path
Policy Compass saves profile data in:

```txt
users/{uid}/policyCompass/profile
```

## 8. Quick login test checklist
- Open the app and go to the Policy Compass page directly.
- Confirm the first screen is the standalone auth page, not the chat workspace.
- Confirm the Google button shows the colored Google icon.
- Enter an email and click `Continue`.
- Confirm Google popup opens.
- If popup does not open, check browser popup blocking first.
- Finish Google sign-in.
- Confirm you see a short "Preparing your workspace" screen before the chat opens.
- Confirm you land safely in the Policy Compass workspace.
- Confirm the left side shows a collapsed citizen summary, not the full profile editor.
- Click `Edit Profile`.
- Change one or two profile values and save.
- Refresh the page.
- Confirm the saved profile values come back from Firestore.
- Open Firestore and confirm the document exists at `users/{uid}/policyCompass/profile`.
- Click `Sign Out`.
- Confirm you return to the standalone auth page.
