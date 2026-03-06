import { expect, test } from "@playwright/test";

const email = "drsyedirfan93@gmail.com";
const password = "Fra1ni4m";

test("password login unlocks studio and admin surfaces", async ({ page }) => {
  await page.goto("/login");

  const signInForm = page.locator("form").first();
  await signInForm.getByPlaceholder("you@studio.com").fill(email);
  await signInForm.getByPlaceholder("Password").fill(password);
  await Promise.all([
    page.waitForURL("**/", { timeout: 20_000 }),
    signInForm.getByRole("button", { name: "Sign in with password" }).click(),
  ]);

  await page.goto("/studio");
  await expect(
    page.getByRole("heading", { name: "Manage your identity and editorial surface." }),
  ).toBeVisible();

  await page.goto("/admin");
  await expect(
    page.getByRole("heading", { name: "Operations and catalog control" }),
  ).toBeVisible();
});
