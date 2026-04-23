# Deploying 1Peace to Firebase Hosting

## One-time setup

### 1. Install Firebase CLI
```
npm install -g firebase-tools
```

### 2. Log in to Firebase
```
firebase login
```
Follow the browser prompt to sign in with your Google account.

---

## Every time you deploy

### Step 1 — Build the site
```
npm run build
```
This compiles your code and bakes in the API keys from `.env.local`. The output goes into the `dist/` folder.

> Always run this after any code changes before deploying.

### Step 2 — Deploy
```
firebase deploy --only hosting
```

After a few seconds you'll see:
```
Hosting URL: https://peace-494013.web.app
```
That's your live site.

---

## Updating the site

Whenever you make changes:
```
npm run build
firebase deploy --only hosting
```

---

## Troubleshooting

**"firebase: command not found"**  
Run `npm install -g firebase-tools` first.

**"Error: Failed to get Firebase project"**  
Run `firebase login` again to refresh your credentials.

**Page shows blank after deploy**  
Check that your `.env.local` has real values (not placeholder text from `.env.example`), then rebuild and redeploy.
