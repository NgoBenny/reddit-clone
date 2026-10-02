const assert = require("node:assert/strict");
const { chromium } = require("playwright");

async function main() {
  const base = "http://localhost:3000";
  const browser = await chromium.launch({ channel: "msedge" });
  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  try {
    for (const theme of ["light", "dark"]) {
      await page.emulateMedia({ colorScheme: theme });
      for (const width of [320, 390, 1440]) {
        await page.setViewportSize({ width, height: 900 });
        for (const route of ["privacy", "terms", "cookies", "contact"]) {
          const response = await page.goto(`${base}/${route}`);
          assert.equal(response.status(), 200);
          assert.equal(await page.locator("main h1").count(), 1);
          assert.ok((await page.title()).includes("Common"));
          assert.equal(
            await page.getByRole("navigation", { name: "Policies" }).count(),
            1,
          );
          assert.ok(
            await page.evaluate(
              () => document.documentElement.scrollWidth <= innerWidth + 1,
            ),
            `${theme}/${width}/${route} fits`,
          );
          assert.ok(
            await page
              .locator('meta[property="og:image"]')
              .getAttribute("content"),
          );
        }
      }
    }
    const missing = await page.goto(`${base}/qa-missing-launch-route`);
    assert.equal(missing.status(), 404);
    await page.getByRole("link", { name: "Explore conversations" }).click();
    await page.waitForURL(base + "/");
    for (const route of ["robots.txt", "sitemap.xml", "opengraph-image"]) {
      const response = await page.request.get(`${base}/${route}`);
      assert.equal(response.status(), 200, route);
      if (route === "opengraph-image") {
        const metadata = await require("sharp")(
          await response.body(),
        ).metadata();
        assert.equal(metadata.width, 1200);
        assert.equal(metadata.height, 630);
      } else {
        assert.ok(
          (await response.text()).includes(
            route === "robots.txt" ? "Disallow: /settings" : "/privacy",
          ),
        );
      }
    }
    assert.deepEqual(errors, [], "No uncaught browser errors");
    console.log(
      "Launch browser checks passed: four policies, both themes, three widths, footer, metadata, HTTP 404 recovery, robots, sitemap and social image.",
    );
  } finally {
    await browser.close();
  }
}
main().catch((error) => {
  console.error(error.stack);
  process.exitCode = 1;
});
