import { expect, test, type Page } from "@playwright/test";

const email = process.env.PLAYWRIGHT_TEST_EMAIL;
const password = process.env.PLAYWRIGHT_TEST_PASSWORD;

async function signIn(page: Page) {
  await page.goto("/login");

  const signInForm = page.locator("main form").first();
  await signInForm.getByPlaceholder("you@studio.com").fill(email!);
  await signInForm.getByPlaceholder("Password").fill(password!);
  await Promise.all([
    page.waitForURL("**/", { timeout: 20_000 }),
    signInForm.getByRole("button", { name: "Sign in with password" }).click(),
  ]);
}

test("password login unlocks studio and admin surfaces", async ({ page }) => {
  test.skip(!email || !password, "PLAYWRIGHT_TEST_EMAIL and PLAYWRIGHT_TEST_PASSWORD are required.");
  await signIn(page);

  await page.goto("/studio");
  await expect(
    page.getByRole("heading", { name: "Manage your identity and editorial surface." }),
  ).toBeVisible();

  await page.goto("/admin");
  await expect(
    page.getByRole("heading", { name: "Operations and catalog control" }),
  ).toBeVisible();
});

test("creator can schedule and join a watch lounge", async ({ page }) => {
  test.skip(!email || !password, "PLAYWRIGHT_TEST_EMAIL and PLAYWRIGHT_TEST_PASSWORD are required.");
  await signIn(page);

  await page.goto("/studio");
  await expect(
    page.getByRole("heading", { name: "Manage your identity and editorial surface." }),
  ).toBeVisible();

  const scheduleForm = page.getByTestId("schedule-watch-event-form");
  test.skip(!(await scheduleForm.isVisible()), "This account cannot schedule watch events.");

  const filmOptionCount = await scheduleForm.locator('select[name="filmId"] option').count();
  test.skip(filmOptionCount === 0, "Scheduling requires at least one accepted film.");

  const uniqueTitle = `Codex Launch ${Date.now()}`;
  const uniqueMessage = `Codex live note ${Date.now()}`;

  await page.getByTestId("schedule-watch-event-title").fill(uniqueTitle);
  await Promise.all([
    page.waitForURL(/\/studio(\?|$)/, { timeout: 20_000 }),
    scheduleForm.getByRole("button", { name: "Schedule launch party" }).click(),
  ]);

  const eventHeading = page.getByRole("heading", { name: uniqueTitle }).first();
  await expect(eventHeading).toBeVisible({ timeout: 20_000 });

  const eventCard = page.getByTestId(/watch-event-card-/).filter({ has: eventHeading }).first();
  await Promise.all([
    page.waitForURL(/\/watch\//, { timeout: 20_000 }),
    eventCard.getByRole("link", { name: "Open lounge" }).click(),
  ]);

  await expect(page.getByTestId("watch-event-lounge")).toBeVisible();
  await page.getByTestId("watch-event-message-input").fill(uniqueMessage);
  await page.getByTestId("watch-event-message-submit").click();
  await expect(page.getByText(uniqueMessage)).toBeVisible({ timeout: 20_000 });
});
