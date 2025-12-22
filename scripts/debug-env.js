const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

const envConfig = dotenv.config({ path: ".env.local" }).parsed;

if (!envConfig) {
  console.log("No .env.local file found or empty.");
} else {
  console.log("Found keys in .env.local:");
  Object.keys(envConfig).forEach((key) => {
    // Simple heuristic to identify potential connection strings
    const isUrl =
      key.includes("URL") ||
      key.includes("DB") ||
      key.includes("POSTGRES") ||
      key.includes("SUPABASE");
    console.log(`- ${key} ${isUrl ? "(Potential Match)" : ""}`);
  });
}
