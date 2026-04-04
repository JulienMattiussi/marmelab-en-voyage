import { test, expect } from '@playwright/test';

test.describe('Event page', () => {
  test('displays the event title', async ({ page }) => {
    await page.goto('/belmont-2025');
    await expect(page.locator('h1')).toBeVisible();
  });

  test('displays the countdown table', async ({ page }) => {
    await page.goto('/belmont-2025');
    await expect(page.locator('table')).toBeVisible();
  });

  test('shows days, hours, minutes, seconds labels', async ({ page }) => {
    await page.goto('/belmont-2025');
    const text = await page.locator('table').innerText();
    expect(text).toMatch(/jour/);
    expect(text).toMatch(/heure/);
    expect(text).toMatch(/minute/);
    expect(text).toMatch(/seconde/);
  });

  test('displays beer progress icons', async ({ page }) => {
    await page.goto('/belmont-2025');
    // There should be 9 beer images
    const beerImages = page.locator('.beer-row img');
    await expect(beerImages).toHaveCount(9);
  });

  test('displays the Marmelab logo', async ({ page }) => {
    await page.goto('/belmont-2025');
    await expect(page.locator('img[alt="Marmelab logo"]')).toBeVisible();
  });

  test('returns 404 for an unknown event slug', async ({ page }) => {
    const response = await page.goto('/this-event-does-not-exist');
    expect(response?.status()).toBe(404);
  });
});
