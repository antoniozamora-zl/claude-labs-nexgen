import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:3000';

async function debug() {
  let hasError = false;
  const errors = [];

  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  page.on('console', msg => {
    console.log(`[${msg.type().toUpperCase()}] ${msg.text()}`);
  });

  page.on('error', err => {
    console.error('PAGE ERROR:', err);
    hasError = true;
    errors.push(err);
  });

  page.on('response', res => {
    if (res.status() >= 400) {
      console.log(`HTTP ${res.status()}: ${res.url()}`);
    }
  });

  try {
    console.log('🔍 Loading page...');
    await page.goto(BASE_URL);

    // Wait for any async setup
    await page.waitForTimeout(5000);

    const rootHTML = await page.evaluate(() => {
      const root = document.getElementById('root');
      return {
        html: root ? root.innerHTML : 'NO ROOT',
        children: root ? root.childNodes.length : 'NO ROOT',
        display: root ? window.getComputedStyle(root).display : 'N/A'
      };
    });

    console.log('\n📊 Root element state:');
    console.log(JSON.stringify(rootHTML, null, 2));

    // Check window errors
    const windowErrors = await page.evaluate(() => {
      return {
        errorCount: window.__reactError ? 1 : 0,
        reactVersion: window.React ? 'loaded' : 'NOT LOADED',
        appMounted: document.body.innerHTML.includes('App') ? 'maybe' : 'no',
      };
    });

    console.log('\n🔎 Window state:');
    console.log(JSON.stringify(windowErrors, null, 2));

  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await browser.close();
  }
}

debug();
