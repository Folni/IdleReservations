// Frontend/tests/frontend.spec.js
import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5500'; 

test.describe('IdleReservations Frontend Integration Tests', () => {

  // 1. Test učitavanja početne stranice i navigacije
  test('should load landing page elements', async ({ page }) => {
    await page.goto(`${BASE_URL}/index.html`);
    await expect(page).toHaveTitle(/IdleReservations/);
    await expect(page.locator('h1.hero-title')).toContainText('IdleReservations');
    await expect(page.locator('#nav')).toBeVisible();
  });

  // 2. Test validacije Login forme
  test('login form should show error on empty fields', async ({ page }) => {
    await page.goto(`${BASE_URL}/auth.html`);
    // Pretpostavljamo da je login form prvi vidljiv ili ima ID
    await page.click('button[type="submit"]'); 
    
    // Provjera toast poruke ili poruke na ekranu
    const errorMessage = page.locator('#login-message');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText('Korisničko ime i lozinka su obavezni');
  });

  // 3. Test pristupa zaštićenoj ruti (Profile) bez prijave
  test('should redirect to auth.html when accessing profile unauthorized', async ({ page }) => {
    await page.goto(`${BASE_URL}/profile.html`);
    // Ovisno o logici u js/pages/profilePage.js, trebao bi redirectati
    await expect(page).toHaveURL(/auth.html/);
  });

  // 4. Test registracijske forme (UI postojanost)
  test('registration form should have all required fields', async ({ page }) => {
    await page.goto(`${BASE_URL}/auth.html`);
    // Ako imaš toggle između login/register, klikni ga
    const registerForm = page.locator('#register-form');
    if (await registerForm.isHidden()) {
        await page.click('text=Registriraj se'); // Primjer switchera
    }
    
    await expect(page.locator('#register-username')).toBeVisible();
    await expect(page.locator('#register-email')).toBeVisible();
    await expect(page.locator('#register-password')).toBeVisible();
  });

  // 5. Test mobilne navigacije (Viewport test)
  test('should show mobile menu triggers on small screens', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(`${BASE_URL}/index.html`);
    
    // Provjera hamburger menija ako ga imaš u Bootstrapu
    const toggle = page.locator('.navbar-toggler');
    if (await toggle.count() > 0) {
        await expect(toggle).toBeVisible();
    }
  });

});