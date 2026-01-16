const fetch = require('node-fetch');

const FSHIP_API_BASE = "https://capi.fship.in/api";
const SECRET_KEY = "282b1cf2f542bc8335c8f18872e28466147e37af78b74258731d3285cf46031a";
const AWB = "143455210101006"; // Sample from docs

async function testHeader(name, value) {
  console.log(`Testing Header: ${name}: ${value}`);
  try {
    const res = await fetch(`${FSHIP_API_BASE}/trackinghistory`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        [name]: value
      },
      body: JSON.stringify({ waybill: AWB })
    });
    const data = await res.text();
    console.log(`Status: ${res.status}`);
    console.log(`Body: ${data.substring(0, 500)}`);
    console.log("-----------------------------------");
  } catch (err) {
    console.error(`Error: ${err.message}`);
  }
}

async function run() {
  await testHeader("signature", `bearer ${SECRET_KEY}`);
  await testHeader("signature", SECRET_KEY);
  await testHeader("Signature", `bearer ${SECRET_KEY}`);
  await testHeader("Signature", SECRET_KEY);
  await testHeader("Authorization", `bearer ${SECRET_KEY}`);
  await testHeader("Authorization", SECRET_KEY);
  await testHeader("token", SECRET_KEY);
}

run();
