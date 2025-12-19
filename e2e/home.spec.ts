import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('has title and main sections', async ({ page }) => {
    await page.goto('/');

    // Check title
    await expect(page).toHaveTitle(/Flash/i);

    // Check Hero "Shop Now" button
    const shopButton = page.getByRole('link', { name: 'Shop Now' });
    await expect(shopButton).toBeVisible();

    // Check Navbar
    const nav = page.locator('header');
    await expect(nav).toBeVisible();
  });

  test('can navigate to shop page', async ({ page }) => {
    await page.goto('/');
    
    // Click Shop Now
    await page.getByRole('link', { name: 'Shop Now' }).click();

    // Expect url to be /shop
    await expect(page).toHaveURL(/.*shop/);
    
    // Expect Header or Grid to be visible (Common to both)
    // The "Flash" logo or generic Shop UI
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });
});
