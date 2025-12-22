const url =
  "https://gyizmixhmrfwywvafdbi.supabase.co/storage/v1/object/public/products/prod_1765736252146_0.4732433284565124.png";
const resizedUrl = url + "?width=100";

async function check() {
  const res1 = await fetch(url, { method: "HEAD" });
  const len1 = res1.headers.get("content-length");
  console.log(`Original Length: ${len1}`);

  const res2 = await fetch(resizedUrl, { method: "HEAD" });
  const len2 = res2.headers.get("content-length");
  console.log(`Resized Length: ${len2}`);

  if (len1 !== len2) {
    console.log("Transformation working (size changed)");
  } else {
    console.log("Transformation NOT working (size same)");
  }
}

check();
