import { expect, test } from "@playwright/test";

test("home and catalog present media-first browse surfaces", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });

  await expect(page.locator("main").getByText("Featured film").first()).toBeVisible();
  await expect(page.getByRole("heading", { name: "Long-form films worth opening full screen." })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Curated rails, not feed clutter." })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Afterlight Valley" }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: /Festival Contenders/i })).toBeVisible();
  await expect(page.getByText("Each rail now carries real titles")).toBeVisible();

  await page.goto("/films", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "Browse films" })).toBeVisible();
  await expect(page.locator("main").getByPlaceholder("Title, creator, or #serial")).toBeVisible();
});

test("collection and creator routes are navigable public entry points", async ({ page }) => {
  await page.goto("/collections/festival-contenders", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "Festival Contenders" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "A navigable rail, not a dead end." })).toBeVisible();
  await expect(page.getByText("Highlighted picks")).toBeVisible();

  await page.goto("/creators", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "Director spotlights" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Mira Sol/i }).first()).toBeVisible();

  await page.goto("/agents", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "Bring the creator companion, not anonymous bot noise." })).toBeVisible();
  await expect(page.getByRole("link", { name: "Atlas Lobby", exact: true }).first()).toBeVisible();

  await page.goto("/watch/afterlight-valley-launch-party", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "Afterlight Valley Launch Party" })).toBeVisible();
  await expect(page.getByText("Humans and agents, split cleanly.")).toBeVisible();
});
