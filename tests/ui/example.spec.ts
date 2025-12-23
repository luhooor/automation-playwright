import { test, expect } from '@playwright/test';

test.describe('UI Testing Examples', () => {
  
  test('should navigate to Playwright website and verify title', async ({ page }) => {
    await page.goto('https://playwright.dev');
    
    await expect(page).toHaveTitle(/Playwright/);
  });

  test('should search for documentation', async ({ page }) => {
    await page.goto('https://playwright.dev');
    
    const searchButton = page.locator('button[aria-label="Search"]').first();
    if (await searchButton.isVisible()) {
      await searchButton.click();
      
      const searchBox = page.locator('input[type="search"]').first();
      await searchBox.fill('API testing');
      await page.waitForTimeout(500);
      
      const searchResults = page.locator('.search-result');
      await expect(searchResults.first()).toBeVisible();
    }
  });

  test('should verify navigation links', async ({ page }) => {
    await page.goto('https://playwright.dev');
    
    const navLinks = page.locator('nav a');
    const count = await navLinks.count();
    expect(count).toBeGreaterThan(0);
    
    const docsLink = page.locator('a:has-text("Docs")').first();
    if (await docsLink.isVisible()) {
      await docsLink.click();
      await expect(page).toHaveURL(/.*docs/);
    }
  });

  test('should handle form interactions', async ({ page }) => {
    await page.goto('https://httpbin.org/forms/post');
    
    await page.fill('input[name="custname"]', 'John Doe');
    await page.fill('input[name="custtel"]', '123-456-7890');
    await page.fill('input[name="custemail"]', 'john@example.com');
    
    await page.selectOption('select[name="size"]', 'medium');
    
    await page.check('input[value="bacon"]');
    await page.check('input[value="cheese"]');
    
    await expect(page.locator('input[name="custname"]')).toHaveValue('John Doe');
    await expect(page.locator('input[name="custemail"]')).toHaveValue('john@example.com');
  });

  test('should verify page elements visibility', async ({ page }) => {
    await page.goto('https://playwright.dev');
    
    await page.waitForLoadState('networkidle');
    
    const logo = page.locator('a[href="/"]').first();
    await expect(logo).toBeVisible();
    
    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible();
  });

  test('should handle multiple tabs/windows', async ({ context, page }) => {
    await page.goto('https://playwright.dev');
    
    const newPage = await context.newPage();
    await newPage.goto('https://example.com');
    
    expect(context.pages().length).toBeGreaterThanOrEqual(2);
    
    await page.bringToFront();
    await expect(page).toHaveURL(/playwright/);
    
    await newPage.close();
  });

  test('should take screenshots', async ({ page }) => {
    await page.goto('https://playwright.dev');
    
    await page.screenshot({ path: 'screenshots/full-page.png', fullPage: true });
    
    const logo = page.locator('a[href="/"]').first();
    if (await logo.isVisible()) {
      await logo.screenshot({ path: 'screenshots/logo.png' });
    }
  });

  test('should handle file uploads', async ({ page }) => {
    await page.goto('https://httpbin.org/forms/post');
    
    const fs = require('fs');
    const path = require('path');
    const filePath = path.join(__dirname, '../test-file.txt');
    fs.writeFileSync(filePath, 'Test file content');
    
    const fileInput = page.locator('input[type="file"]');
    if (await fileInput.isVisible()) {
      await fileInput.setInputFiles(filePath);
      
      fs.unlinkSync(filePath);
    }
  });

  test('should handle alerts and dialogs', async ({ page }) => {
    await page.goto('https://the-internet.herokuapp.com/javascript_alerts');
    
    page.on('dialog', async dialog => {
      expect(dialog.type()).toBe('alert');
      expect(dialog.message()).toContain('I am a JS Alert');
      await dialog.accept();
    });
    
    await page.click('button:has-text("Click for JS Alert")');
  });

  test('should verify responsive design', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('https://playwright.dev');
    
    const mobileMenu = page.locator('button[aria-label*="menu"]').first();
    
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.reload();
    
    const nav = page.locator('nav').first();
    await expect(nav).toBeVisible();
  });
});

