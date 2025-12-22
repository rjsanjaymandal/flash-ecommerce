const originalParams = "products/prod_1765736252146_0.4732433284565124.png";
const domain = "https://gyizmixhmrfwywvafdbi.supabase.co";
const renderUrl = `${domain}/storage/v1/render/image/public/${originalParams}?width=100`;

async function check() {
  console.log(`Testing: ${renderUrl}`);
  try {
    const res = await fetch(renderUrl, { method: "HEAD" });
    console.log(`Status: ${res.status}`);
    if (res.status === 200) {
      console.log(`Length: ${res.headers.get("content-length")}`);
    } else {
      console.log("Render endpoint not available (or access denied).");
    }
  } catch (e) {
    console.error(e.message);
  }
}

check();
