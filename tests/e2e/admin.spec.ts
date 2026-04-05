import { test, expect } from './fixtures';

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
    await page.waitForLoadState('networkidle');
    const year = new Date().getFullYear();
    const nameInput = page.locator(`input[placeholder="Marmelab ${year}"]`);
    await nameInput.click({ clickCount: 3 });
    await nameInput.type('Test Event 2026');
    await expect(page.locator(`input[placeholder="marmelab-${year}"]`)).toHaveValue('test-event-2026');
  });

  test('shows the participants grid', async ({ page }) => {
    await page.goto('/admin/new');
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
    const addButton = page.getByRole('button', { name: '+ Ajouter' });
    await addButton.waitFor({ state: 'visible' });
    await addButton.click();
    await expect(page.getByText('Nouveau participant')).toBeVisible();
    await page.getByRole('button', { name: 'Annuler' }).click();
    await expect(page.getByText('Nouveau participant')).not.toBeVisible();
  });

  test('shows id preview while typing a name', async ({ page }) => {
    await page.goto('/admin/participants');
    const addButton = page.getByRole('button', { name: '+ Ajouter' });
    await addButton.waitFor({ state: 'visible' });
    await addButton.click();
    const nameInput = page.locator('input[placeholder="Marie Dupont"]');
    await nameInput.waitFor({ state: 'visible' });
    await nameInput.pressSequentially('Jean Dupont');
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
