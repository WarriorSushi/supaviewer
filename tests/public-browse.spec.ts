import { expect, test } from "@playwright/test";

test("home and catalog present media-first browse surfaces", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByText("Featured tonight")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Tonight's picks" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Editorial rails" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Afterlight Valley/ }).first()).toBeVisible();

  await page.goto("/films");
  await expect(page.getByRole("heading", { name: "Browse films" })).toBeVisible();
  await expect(page.getByPlaceholder("Title, creator, or #serial")).toBeVisible();
});
