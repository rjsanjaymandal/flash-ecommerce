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

> [!TIP]
> If you make changes later, just repeat the build and upload the `standalone` folder again.
