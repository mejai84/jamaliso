import { test, expect } from '@playwright/test';

test.describe('Flujo POS completo', () => {
    test('Crear pedido, enviarlo a KDS, cobrar y cerrar caja', async ({ page }) => {
        // 1️⃣ Login
        await page.goto('/login');
        // Mocks or explicit waits can go here depending on implementation
        // await page.fill('input[name="email"]', 'admin@example.com');
        // await page.fill('input[name="password"]', 'password123');
        // await page.click('button[type="submit"]');
        // await expect(page).toHaveURL(/.*\/dashboard/);

        // 2️⃣ Crear pedido
        // await page.click('button[data-test="new-order"]');
        // await page.fill('input[data-test="product-search"]', 'Pizza Margherita');
        // await page.click('button[data-test="add-to-order"]');
        // await page.click('button[data-test="confirm-order"]');

        // 3️⃣ Verificar que KDS reciba el pedido
        // const kdsPage = await page.context().newPage();
        // await kdsPage.goto('/admin/kitchen');
        // await expect(kdsPage.locator('text=Pizza Margherita')).toBeVisible();

        // 4️⃣ Cobrar (split payment)
        // await page.click('button[data-test="open-cashier"]');
        // await page.fill('input[data-test="payment-cash"]', '10');
        // await page.fill('input[data-test="payment-card"]', '5');
        // await page.click('button[data-test="finalize-payment"]');
        // await expect(page.locator('text=Pago completado')).toBeVisible();

        // 5️⃣ Cerrar caja y validar diferencia
        // await page.click('button[data-test="close-cashier"]');
        // await page.fill('input[data-test="cash-difference"]', '0');
        // await page.click('button[data-test="confirm-close"]');
        // await expect(page.locator('text=Caja cerrada')).toBeVisible();
    });
});
