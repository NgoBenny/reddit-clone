const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("playwright");

// This checks the real local UI without bypassing authentication or changing application data.
async function main() {
  const base = process.env.BROWSER_TEST_URL || "http://localhost:3000";
  assert.ok(["http://localhost:3000", "http://127.0.0.1:3000"].includes(base));
  const browser = await chromium.launch({ channel: "msedge" });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    colorScheme: "light",
  });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("response", (response) => {
    if (response.url().startsWith(base) && response.status() >= 500)
      errors.push(
        "HTTP " + response.status() + " " + new URL(response.url()).pathname,
      );
  });
  const output = path.resolve(".impeccable/review");
  fs.mkdirSync(output, { recursive: true });
  let checks = 0;
  async function checkLayout() {
    const dimensions = await page.evaluate(() => ({
      width: innerWidth,
      page: document.documentElement.scrollWidth,
    }));
    assert.ok(
      dimensions.page <= dimensions.width + 1,
      "No horizontal overflow at " + dimensions.width,
    );
    assert.equal(await page.locator("main h1").count(), 1, "One page heading");
    checks++;
  }
  async function theme(name) {
    await page
      .getByRole("button", { name: "Toggle theme", exact: true })
      .click();
    await page.getByRole("menuitem", { name, exact: true }).click();
    await page.locator("html").evaluate((element, dark) => {
      if (element.classList.contains("dark") !== dark)
        throw new Error("Theme did not apply");
    }, name === "Dark");
    checks++;
  }
  try {
    await page.goto(base);
    await page
      .getByRole("heading", {
        name: "Discover a different perspective",
        exact: true,
      })
      .waitFor();
    assert.equal(
      await page.getByRole("combobox", { name: "Time", exact: true }).count(),
      0,
    );
    await page
      .getByRole("combobox", { name: "Sort", exact: true })
      .selectOption("top");
    await page.getByRole("combobox", { name: "Time", exact: true }).waitFor();
    await page
      .getByRole("combobox", { name: "Time", exact: true })
      .selectOption("day");
    await page
      .getByRole("button", { name: "Apply filters", exact: true })
      .click();
    await page.waitForURL(/time=day/);
    await page
      .getByRole("combobox", { name: "Sort", exact: true })
      .selectOption("new");
    await page
      .getByRole("button", { name: "Apply filters", exact: true })
      .click();
    await page.waitForURL((url) => !url.searchParams.has("time"));
    checks += 3;
    await page
      .getByRole("searchbox", { name: "Search conversations", exact: true })
      .fill("no-results-qa-redesign");
    await page
      .getByRole("button", { name: "Search conversations", exact: true })
      .click();
    await page
      .getByRole("heading", { name: "No conversations match", exact: true })
      .waitFor();
    await page
      .getByRole("link", { name: "Clear filters", exact: true })
      .first()
      .click();
    await page.waitForURL(base + "/");
    checks += 2;

    for (const width of [1440, 1024, 768, 390, 320]) {
      await page.setViewportSize({ width, height: 1000 });
      await checkLayout();
      if (width === 1440) {
        assert.ok(
          await page
            .getByRole("navigation", { name: "Main navigation", exact: true })
            .isVisible(),
        );
        await page.screenshot({
          path: path.join(output, "desktop-light.png"),
          fullPage: true,
        });
      }
      if (width === 390) {
        assert.ok(
          await page
            .getByRole("navigation", { name: "Mobile navigation", exact: true })
            .isVisible(),
        );
        await page.screenshot({
          path: path.join(output, "mobile-light.png"),
          fullPage: true,
        });
      }
    }
    await page.setViewportSize({ width: 1440, height: 1000 });
    await theme("Dark");
    await page.screenshot({
      path: path.join(output, "desktop-dark.png"),
      fullPage: true,
    });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.screenshot({
      path: path.join(output, "mobile-dark.png"),
      fullPage: true,
    });
    await checkLayout();
    await theme("Light");
    await page.setViewportSize({ width: 1440, height: 1000 });

    await page
      .getByRole("link", { name: "Start a conversation", exact: true })
      .click();
    await page
      .getByRole("heading", { name: "Choose a community", exact: true })
      .waitFor();
    await page
      .getByRole("searchbox", { name: "Search communities", exact: true })
      .fill("qa-fix-1001");
    await page.getByRole("button", { name: "Search", exact: true }).click();
    await page.waitForURL(/compose=1.*q=qa-fix-1001/);
    assert.equal(
      await page
        .getByRole("heading", { name: "Choose a community", exact: true })
        .count(),
      1,
    );
    await page.getByRole("link", { name: "qa-fix-1001", exact: true }).click();
    await page
      .getByRole("heading", { name: "qa-fix-1001", exact: true })
      .waitFor();
    await page.getByText("Community rules & flair", { exact: true }).click();
    await page
      .getByText("QA retained rules draft", { exact: true })
      .first()
      .waitFor();
    await page.screenshot({
      path: path.join(output, "community-desktop.png"),
      fullPage: true,
    });
    await page.setViewportSize({ width: 390, height: 844 });
    await checkLayout();
    await page.screenshot({
      path: path.join(output, "community-mobile.png"),
      fullPage: true,
    });
    checks += 3;

    const postLink = page.getByRole("link", {
      name: "QA Common redesign workflow — edited",
      exact: true,
    });
    await postLink.click();
    await page
      .getByRole("heading", { name: "Discussion", exact: true })
      .waitFor();
    const summary = page.locator("details.thread > summary").first();
    assert.ok(await summary.count(), "QA discussion has a collapsible thread");
    await summary.locator(".thread-chevron").click();
    assert.equal(
      await page.locator("details.thread").first().getAttribute("open"),
      null,
    );
    await summary.press("Enter");
    assert.notEqual(
      await page.locator("details.thread").first().getAttribute("open"),
      null,
    );
    checks += 2;
    await checkLayout();
    await page.screenshot({
      path: path.join(output, "discussion-mobile.png"),
      fullPage: true,
    });
    await page
      .getByRole("button", { name: "Account menu", exact: true })
      .count()
      .then((count) => assert.equal(count, 0));
    await page.goto(base + "/?feed=home");
    await page
      .getByRole("link", {
        name: "Sign in to see your joined communities",
        exact: true,
      })
      .waitFor();
    checks++;
    await page.goto(base);
    await page
      .getByRole("link", { name: "Skip to content", exact: true })
      .focus();
    assert.equal(
      await page
        .getByRole("link", { name: "Skip to content", exact: true })
        .evaluate((element) => getComputedStyle(element).position),
      "fixed",
    );
    checks++;
    assert.deepEqual(
      errors,
      [],
      "No uncaught browser errors or local HTTP 500 responses",
    );
    fs.writeFileSync(
      path.join(output, "browser-results.json"),
      JSON.stringify(
        { checks, widths: [1440, 1024, 768, 390, 320], errors },
        null,
        2,
      ),
    );
    console.log(
      "Redesign browser checks passed: " +
        checks +
        " checks, five widths, light/dark, search, filters, community chooser, rules, threads, keyboard and signed-out behavior.",
    );
  } finally {
    await browser.close();
  }
}
main().catch((error) => {
  console.error(error.stack);
  process.exitCode = 1;
});
