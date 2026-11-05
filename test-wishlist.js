const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e.stack || e)));
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push("[console] " + msg.text());
  });

  console.log("--- Fresh, empty wishlist ---");
  await page.goto("http://localhost:3000/wishlist", { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  console.log("body:", (await page.evaluate(() => document.body.innerText)).slice(0, 200));
  console.log("errors so far:", errors.length, errors);

  console.log("\n--- Add an item via the real flow, then revisit wishlist ---");
  errors.length = 0;
  await page.goto("http://localhost:3000/quran/1", { waitUntil: "networkidle" });
  const heart = page.locator('button[aria-label*="Seçilmiş"]').first();
  await heart.click();
  await page.waitForTimeout(300);

  await page.goto("http://localhost:3000/wishlist", { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  console.log("body:", (await page.evaluate(() => document.body.innerText)).slice(0, 400));
  console.log("errors:", errors.length, errors);

  const ls = await page.evaluate(() => localStorage.getItem("wishlist"));
  console.log("wishlist localStorage:", ls);

  await browser.close();
})();
