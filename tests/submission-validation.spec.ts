import { expect, test } from "@playwright/test";

const email = process.env.PLAYWRIGHT_TEST_EMAIL;
const password = process.env.PLAYWRIGHT_TEST_PASSWORD;

test("@headless-only duplicate YouTube sources are rejected in submission flow", async ({ page }) => {
  test.skip(!email || !password, "PLAYWRIGHT_TEST_EMAIL and PLAYWRIGHT_TEST_PASSWORD are required.");

  await page.goto("/login");

  const signInForm = page.locator("main form").first();
  await signInForm.getByPlaceholder("you@studio.com").fill(email!);
  await signInForm.getByPlaceholder("Password").fill(password!);
  await Promise.all([
    page.waitForURL("**/", { timeout: 20_000 }),
    signInForm.getByRole("button", { name: "Sign in with password" }).click(),
  ]);

  await page.goto("/submit");

  await page.getByPlaceholder("https://youtube.com/watch?v=...").fill("https://www.youtube.com/watch?v=yplb0yBEiRo");
  await page.getByPlaceholder("Afterlight Valley").fill("Duplicate source check");
  await page.getByPlaceholder("82 min").fill("82");
  await page.getByPlaceholder("One to two lines that position the film clearly.").fill("A duplicate submission test.");
  await page.getByPlaceholder("Sora, Runway, ElevenLabs").fill("Sora");
  await page.locator('input[name="ai_confirmed"]').check();
  await page.locator('input[name="rights_confirmed"]').check();
  await page.locator('input[name="serial_policy_confirmed"]').check();

  await Promise.all([
    page.waitForURL("**/submit?error=duplicate-video", { timeout: 20_000 }),
    page.getByRole("button", { name: "Submit for review" }).click(),
  ]);

  await expect(
    page.getByText("That YouTube source is already in the catalog or waiting in the review queue."),
  ).toBeVisible();
});
