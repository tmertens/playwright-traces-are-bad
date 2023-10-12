import {test, Locator} from '@playwright/test';

test('traces perform very badly with simple websites', async ({ page }) => {
  test.setTimeout(120000);
  const start = Date.now();

  await page.goto('https://playwright.dev/');
  const locator: Locator = page.locator('[aria-label="Main"]')
  for(let i = 0; i < 1000; i++){
    await locator.isVisible();
  }

  console.log(`End of test reached after ${Math.floor((Date.now() - start) / 1000)} seconds`);
});

test('and much worse with a more complicated website', async ({ page }) => {
  test.setTimeout(300000);
  const start = Date.now();

  await page.goto('https://yahoo.com/');
  const locator: Locator = page.locator('#module-ntk')
  for(let i = 0; i < 200; i++){
    await locator.isVisible();
  }

  console.log(`End of test reached after ${Math.floor((Date.now() - start) / 1000)} seconds`);
});
