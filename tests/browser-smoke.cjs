const assert = require("node:assert/strict");
const { chromium } = require("playwright");
async function main() {
  const base = process.env.BROWSER_TEST_URL || "http://localhost:3000";
  assert.ok(
    ["http://localhost:3000", "http://127.0.0.1:3000"].includes(base),
    "Browser smoke tests only use the isolated local app",
  );
  const browser = await chromium.launch({
    channel: process.env.PLAYWRIGHT_CHANNEL || "msedge",
  });
  try {
    const page = await browser.newPage();
    await page.goto(base + "/r/browser-test");
    await page
      .getByRole("combobox", { name: "Sort", exact: true })
      .selectOption("top");
    await page.getByRole("button", { name: "Apply filters" }).click();
    await page.waitForURL(/sort=top/);
    const titles = page.locator("main a > h2");
    assert.equal(await titles.first().innerText(), "Older top");
    await page
      .getByRole("combobox", { name: "Time", exact: true })
      .selectOption("day");
    await page.getByRole("button", { name: "Apply filters" }).click();
    await page.waitForURL(/time=day/);
    assert.equal(
      await page.getByRole("link", { name: "Older top", exact: true }).count(),
      0,
    );
    await page
      .getByRole("combobox", { name: "Time", exact: true })
      .selectOption("all");
    await page
      .getByRole("searchbox", { name: "Search posts", exact: true })
      .fill("Older top");
    await page.getByRole("button", { name: "Apply filters" }).click();
    await page.waitForURL(/q=Older/);
    assert.equal(await titles.count(), 1);
    assert.equal(await titles.first().innerText(), "Older top");
    await page
      .getByRole("link", { name: "u/browser-author", exact: true })
      .click();
    await page
      .getByRole("heading", { name: "u/browser-author", exact: true })
      .waitFor();
    await page.getByRole("link", { name: "Comments", exact: true }).click();
    await page.waitForURL(/tab=comments/);
    await page.goto(base + "/saved");
    await page.waitForURL("https://redditcloneproject.kinde.com/**");
    await page
      .getByRole("heading", { name: "Hey friend! Welcome back", exact: true })
      .waitFor();
    console.log(
      "Playwright browser smoke passed: Top/time/search, profiles and private-page authentication.",
    );
  } finally {
    await browser.close();
  }
}
main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
