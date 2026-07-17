import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:3000';

async function debug() {
  console.log('🔍 Debug: Checking what\'s on the page...\n');

  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  page.on('console', msg => console.log('🌐 BROWSER:', msg.text()));
  page.on('error', err => console.log('❌ PAGE ERROR:', err));

  try {
    console.log('⏳ Navigating to', BASE_URL);
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    console.log('✓ Page loaded');

    // Wait for any pending requests
    await page.waitForLoadState('networkidle');
    console.log('✓ Network idle');

    const root = await page.locator('#root');
    const rootContent = await root.evaluate(el => el.innerHTML);
    console.log('\n📄 Root content:\n', rootContent.substring(0, 300));

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await browser.close();
  }
}

debug();
