# Hostinger Node.js Deployment Guide (Next.js)

Since you've shifted to the Hostinger Business plan, here is how to deploy your app efficiently using the **Node.js Selector**.

## 1. Local Preparation

Because Hostinger shared hosting has limited RAM, it's best to build the app on your computer and upload the result.

1. Run the build command:
   ```bash
   npm run build
   ```
2. Navigate to the `.next/standalone` folder. This contains a minimal version of your app.

## 2. Preparing the Upload Bundle

Next.js standalone mode needs you to manually add the public assets. After the build finishes:

1. Copy the `public` folder from the root of your project into `.next/standalone/`.
2. Copy the `.next/static` folder into `.next/standalone/.next/static`.

**Your `.next/standalone` folder should now look like this:**

- `.next/`
  - `server/`
  - `static/` (You copied this here)
- `public/` (You copied this here)
- `server.js` (This is your entry point)
- `package.json`
- `node_modules/` (Minimal version)

## 3. Uploading to Hostinger

1. Zip the **contents** of the `.next/standalone` folder.
2. Upload the zip file via **Hostinger File Manager** to your domain's folder (usually `domains/yourdomain.com/public_html/` or wherever you want to host it).
3. Extract the zip.

## 4. Hostinger Panel Configuration

1. Go to **Websites** -> **Node.js**.
2. Create or select your Node.js application.
3. **Application Path**: Set this to the folder where you extracted the files.
4. **Application Type**: select `Node.js`.
5. **Application Version**: Select `20.x` or `22.x` (latest available).
6. **Entry Point**: Set this to `server.js`.
7. **Environment Variables**: Add your `.env.local` variables here manually. Based on the codebase, you will likely need at least these:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `RAZORPAY_KEY_ID`
   - `RAZORPAY_KEY_SECRET`
   - `NEXT_PUBLIC_VAPID_PUBLIC_KEY`
   - `VAPID_PRIVATE_KEY`
   - `NEXT_PUBLIC_TYPESENSE_HOST`
   - `NEXT_PUBLIC_TYPESENSE_PORT`
   - `NEXT_PUBLIC_TYPESENSE_PROTOCOL`
   - `TYPESENSE_ADMIN_API_KEY`
   - `RESEND_API_KEY`

## 5. Start the App

Click **Start** or **Run** in the Hostinger panel. Your app should now be live!

## 6. Troubleshooting 🚀

### ❌ Persistent "Server Components render" Error

- **The Cause**: Usually missing **Environment Variables**.
- **Important**: Your **Home Page** specifically requires the `SUPABASE_SERVICE_ROLE_KEY`. If this is missing, the Home Page will crash while other pages work.
- **The Fix**:
  1. Go to the Hostinger Node.js Dashboard.
  2. Verify that `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` are typed correctly.
  3. Ensure there are no leading/trailing spaces in the values.
  4. **Restart** the Node.js app after saving changes.

### ❌ Logo or Images 404 (Not Found)

- **The Cause**: The `public` folder was not uploaded or is in the wrong place.
- **The Fix**:
  - The `public` folder (containing `flash-logo.jpg`) must be **inside** the application folder on Hostinger.
  - Correct structure:
    ```text
    / (root of your app on Hostinger)
    ├── public/
    │   └── flash-logo.jpg
    ├── server.js
    └── .next/
        └── static/
    ```

### ❌ Analytics/PostHog Errors in Console

- **The Cause**: Browsers are caching the old version of your site.
- **The Fix**: Clear your browser cache or use an Incognito window to confirm the new clean code is running.

## 7. Clean Deployment Checklist 🧹

If you are seeing old errors (like Vercel 404s) or Auth is not working:

1.  **Clear Local Cache**:
    - `rm -rf .next`
    - `npm run build`
2.  **Clear Hostinger Files**:
    - Log in to File Manager.
    - Delete everything in your `public_html` (or your app folder) EXCEPT the `.env` if you have one there.
3.  **Upload fresh contents** from `.next/standalone`.
4.  **RESTART Node.js App**: In the Hostinger Node.js Dashboard, click "Stop" and then "Start" after you change any environment variables. **Changes do NOT apply until you restart.**

### 🛑 Special Note on Auth

`Navbar Auth State: {email: undefined...}` usually means either:

- The `NEXT_PUBLIC_SUPABASE_URL` was missing **during your local build**.
- The `SUPABASE_SERVICE_ROLE_KEY` is missing in the **Hostinger Dashboard**.
- You haven't **restarted** the Node.js app after adding variables.

> [!TIP]
> If you make changes later, just repeat the build and upload the `standalone` folder again.
