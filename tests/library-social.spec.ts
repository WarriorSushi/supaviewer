import { expect, test } from "@playwright/test";

const email = "drsyedirfan93@gmail.com";
const password = "Fra1ni4m";

test("@headless-only liked and saved films appear in the library", async ({ page }) => {
  await page.goto("/login");

  const signInForm = page.locator("form").first();
  await signInForm.getByPlaceholder("you@studio.com").fill(email);
  await signInForm.getByPlaceholder("Password").fill(password);
  await Promise.all([
    page.waitForURL("**/", { timeout: 20_000 }),
    signInForm.getByRole("button", { name: "Sign in with password" }).click(),
  ]);

  await page.goto("/films/1-afterlight-valley");

  const likeButton = page.getByRole("button", { name: /Like|Liked/ }).first();
  const saveButton = page.getByRole("button", { name: /Save|Saved/ }).first();

  if ((await likeButton.getAttribute("aria-pressed")) !== "true") {
    await likeButton.click();
  }
  if ((await saveButton.getAttribute("aria-pressed")) !== "true") {
    await saveButton.click();
  }

  await page.waitForTimeout(1200);
  await page.reload();
  await expect(page.getByRole("button", { name: /Like|Liked/, pressed: true }).first()).toBeVisible();
  await expect(page.getByRole("button", { name: /Save|Saved/, pressed: true }).first()).toBeVisible();

  await page.goto("/library");

  await expect(page.getByRole("heading", { name: "Watch later" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Strong reactions" })).toBeVisible();
  await expect(page.getByText("You have not saved any films yet.")).toHaveCount(0);
  await expect(page.getByText("Like a film to keep it in your reaction history.")).toHaveCount(0);
  await expect(page.getByRole("link", { name: /Afterlight Valley/ }).first()).toBeVisible();
});
