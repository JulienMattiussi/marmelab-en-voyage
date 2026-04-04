import { test, expect } from '@playwright/test';

test.describe('Admin — events list', () => {
  test('displays the events admin page', async ({ page }) => {
    await page.goto('/admin');
    await expect(page.locator('h1')).toContainText('Événements');
  });

  test('shows the belmont-2025 event in the table', async ({ page }) => {
    await page.goto('/admin');
    await expect(page.getByText('belmont-2025')).toBeVisible();
  });

  test('shows links to participants and new event pages', async ({ page }) => {
    await page.goto('/admin');
    await expect(page.getByRole('link', { name: 'Participants' })).toBeVisible();
    await expect(page.getByRole('link', { name: /Nouvel événement/ })).toBeVisible();
  });
});

test.describe('Admin — new event', () => {
  test('auto-generates slug from name', async ({ page }) => {
    await page.goto('/admin/new');
    await page.fill('input[placeholder="Belmont 2025"]', 'Test Event 2026');
    await expect(page.locator('input[placeholder="belmont-2025"]')).toHaveValue('test-event-2026');
  });

  test('shows the participants grid', async ({ page }) => {
    await page.goto('/admin/new');
    // Active participants from participants.json should appear
    await expect(page.locator('.participants-grid')).toBeVisible();
  });
});

test.describe('Admin — participants', () => {
  test('displays the participants page', async ({ page }) => {
    await page.goto('/admin/participants');
    await expect(page.locator('h1')).toContainText('Participants');
  });

  test('shows the active participants section', async ({ page }) => {
    await page.goto('/admin/participants');
    await expect(page.getByText('Actifs')).toBeVisible();
  });

  test('can toggle the add form', async ({ page }) => {
    await page.goto('/admin/participants');
    const btn = page.getByRole('button', { name: '+ Ajouter' });
    await btn.click();
    await expect(page.getByText('Nouveau participant')).toBeVisible();
    await page.getByRole('button', { name: 'Annuler' }).click();
    await expect(page.getByText('Nouveau participant')).not.toBeVisible();
  });

  test('shows id preview while typing a name', async ({ page }) => {
    await page.goto('/admin/participants');
    await page.getByRole('button', { name: '+ Ajouter' }).click();
    await page.fill('input[placeholder="Marie Dupont"]', 'Jean Dupont');
    await expect(page.getByText(/id\s*:\s*jeandupont/)).toBeVisible();
  });
});

test.describe('Admin — event editor', () => {
  test('loads the existing belmont-2025 event', async ({ page }) => {
    await page.goto('/admin/belmont-2025');
    await expect(page.locator('h1')).toContainText('Belmont');
  });

  test('shows a preview link', async ({ page }) => {
    await page.goto('/admin/belmont-2025');
    await expect(page.getByRole('link', { name: /Aperçu/ })).toBeVisible();
  });
});
