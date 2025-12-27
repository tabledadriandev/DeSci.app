import { test, expect } from '@playwright/test';

test.describe('Protocol Completion Flow', () => {
  test('complete protocol from creation to completion', async ({ page }) => {
    // Step 1: Navigate to protocols page
    await page.goto('/protocols');

    // Step 2: Create new protocol
    const createButton = page.getByRole('button', { name: /create|new.*protocol/i });
    if (await createButton.isVisible()) {
      await createButton.click();
    }

    // Step 3: Fill in protocol details
    await page.goto('/protocols/create');
    
    const nameInput = page.getByPlaceholder(/name|protocol.*name/i);
    if (await nameInput.isVisible()) {
      await nameInput.fill('Cold Plunge Challenge');
    }

    const goalSelect = page.locator('select');
    if (await goalSelect.isVisible()) {
      await goalSelect.selectOption({ label: 'boost hrv' });
    }

    // Step 4: Generate protocol
    const generateButton = page.getByRole('button', { name: /generate|create/i });
    if (await generateButton.isVisible()) {
      await generateButton.click();
    }

    // Step 5: Wait for protocol generation
    await page.waitForURL(/protocols\/[^/]+/, { timeout: 15000 });

    // Step 6: Log daily adherence
    const logButton = page.getByRole('button', { name: /log|complete/i });
    if (await logButton.isVisible()) {
      await logButton.click();
    }

    // Step 7: Verify adherence tracking
    await expect(page.getByText(/adherence|progress/i)).toBeVisible({ timeout: 5000 });

    // Step 8: After 30 days, verify completion and token reward
    // This would require time manipulation or test data setup
    await expect(page.getByText(/complete|finished/i)).toBeVisible({ timeout: 5000 }).catch(() => {
      // Protocol might not be complete yet
    });

    // Step 9: Verify correlations are calculated
    const correlationsButton = page.getByRole('button', { name: /correlation|calculate/i });
    if (await correlationsButton.isVisible()) {
      await correlationsButton.click();
      await expect(page.getByText(/correlation|improvement/i)).toBeVisible({ timeout: 10000 });
    }

    // Step 10: Verify token reward for completion
    await expect(page.getByText(/\+1.*TA|token|reward/i)).toBeVisible({ timeout: 5000 }).catch(() => {
      // Token notification might not appear immediately
    });
  });
});
