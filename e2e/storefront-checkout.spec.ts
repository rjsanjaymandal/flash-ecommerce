import { test, expect } from '@playwright/test';

test.describe('Storefront + Checkout flows', () => {
  test('shop page renders with filter query params', async ({ page }) => {
    await page.goto('/shop?sort=price_asc&size=M');

    await expect(page).toHaveURL(/\/shop\?sort=price_asc&size=M/);
    await expect(page.getByText(/products found/i)).toBeVisible();
    await expect(page.getByRole('heading', { name: /shop/i })).toBeVisible();
  });

  test('checkout renders persisted cart item', async ({ page }) => {
    await page.addInitScript(() => {
      const persisted = {
        state: {
          items: [
            {
              productId: '11111111-1111-1111-1111-111111111111',
              categoryId: '22222222-2222-2222-2222-222222222222',
              slug: 'test-product',
              name: 'Test Product',
              price: 499,
              image: '/placeholder.svg',
              size: 'M',
              color: 'Black',
              fit: 'Regular',
              quantity: 1,
              maxQuantity: 5,
            },
          ],
          savedItems: [],
        },
        version: 0,
      };

      window.localStorage.setItem('flash-cart-storage', JSON.stringify(persisted));
    });

    await page.goto('/checkout');

    await expect(page.getByText(/order summary/i)).toBeVisible();
    await expect(page.getByText('Test Product')).toBeVisible();
    await expect(page.getByRole('button', { name: /pay/i })).toBeVisible();
  });

  test('shop category route resolves', async ({ page }) => {
    await page.goto('/shop/all');

    await expect(page).toHaveURL(/\/shop\/all/);
    await expect(page.getByText(/showing\s+\d+/i)).toBeVisible();
  });
});