/**
 * SUPABASE IMAGE OPTIMIZER SCRIPT
 *
 * Usage: node scripts/optimize-existing-images.js [bucketName]
 *
 * This script:
 * 1. Lists all files in a bucket
 * 2. Filters for non-webp images or large files
 * 3. Downloads, optimizes via SHARP, and re-uploads
 */

const { createClient } = require("@supabase/supabase-js");
const sharp = require("sharp");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Needs service role for list/upload bypass

if (!supabaseServiceKey) {
  console.error("Error: SUPABASE_SERVICE_ROLE_KEY is required in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function optimizeBucket(bucketName) {
  console.log(`\n🚀 Starting optimization for bucket: ${bucketName}\n`);

  const { data: files, error } = await supabase.storage
    .from(bucketName)
    .list("", {
      limit: 1000,
      offset: 0,
    });

  if (error) {
    console.error(`Error listing files:`, error.message);
    return;
  }

  console.log(`Found ${files.length} files. Processing...`);

  for (const file of files) {
    // Skip folders or already optimized webp files (unless forced)
    if (
      file.name === ".emptyFolderPlaceholder" ||
      file.name.endsWith(".webp")
    ) {
      console.log(`⏭️  Skipping: ${file.name}`);
      continue;
    }

    console.log(
      `🖼️  Optimizing: ${file.name} (${(file.metadata.size / 1024).toFixed(2)} KB)`
    );

    try {
      // 1. Download
      const { data: blob, error: downloadError } = await supabase.storage
        .from(bucketName)
        .download(file.name);

      if (downloadError) throw downloadError;

      // 2. Transcode to WebP
      const arrayBuffer = await blob.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const optimizedBuffer = await sharp(buffer)
        .rotate() // Auto-rotate based on EXIF
        .webp({ quality: 85 })
        .toBuffer();

      // 3. Upload with new extension
      const newName = file.name.split(".").slice(0, -1).join(".") + ".webp";

      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(newName, optimizedBuffer, {
          contentType: "image/webp",
          upsert: true,
        });

      if (uploadError) throw uploadError;

      console.log(
        `✅ Success: ${newName} (${(optimizedBuffer.length / 1024).toFixed(2)} KB)`
      );

      // Optional: Delete old file
      // await supabase.storage.from(bucketName).remove([file.name])
    } catch (err) {
      console.error(`❌ Failed: ${file.name}`, err.message);
    }
  }

  console.log(`\n🏁 Done with ${bucketName}!\n`);
}

// Run for common buckets
async function run() {
  const buckets = ["products", "concepts", "reviews"];
  for (const b of buckets) {
    await optimizeBucket(b);
  }
}

run();
