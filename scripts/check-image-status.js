const urls = [
  "https://gyizmixhmrfwywvafdbi.supabase.co/storage/v1/object/public/products/prod_1765736252146_0.4732433284565124.png",
];

async function check() {
  for (const url of urls) {
    try {
      const res = await fetch(url, { method: "HEAD" });
      console.log(`URL: ${url}`);
      console.log(`Status: ${res.status}`);
    } catch (e) {
      console.error(`Failed to fetch ${url}:`, e.message);
    }
  }
}

check();
