import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:3000';

async function verify() {
  console.log('🔍 Starting verification of MetricsDashboard contract...\n');

  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Test 1: Happy path — normal data range
    console.log('📋 Test 1: Happy Path (2026-01-01 to 2026-07-15)');
    await page.goto(BASE_URL);
    await page.fill('input[type="date"]:first-of-type', '2026-01-01');
    await page.fill('input[type="date"]:last-of-type', '2026-07-15');
    await page.click('button:has-text("Cargar métricas")');
    await page.waitForSelector('[data-verify="metrics-dashboard"]');

    const metrics = await page.evaluate(() => {
      const root = document.querySelector('[data-verify="metrics-dashboard"]');
      const total = document.querySelector('[data-metric="total"]')?.dataset.value;
      const approvalRate = document.querySelector('[data-metric="approval-rate"]')?.dataset.value;
      const breakdown = document.querySelector('[data-metric="status-breakdown"]');
      const approved = breakdown?.dataset.approved;
      const pending = breakdown?.dataset.pending;
      const rejected = breakdown?.dataset.rejected;
      const avgTime = document.querySelector('[data-metric="avg-review-time"]')?.dataset.value;

      return { total, approvalRate, approved, pending, rejected, avgTime };
    });

    console.log('  ✓ Metrics loaded:', metrics);

    // Verify invariant: total = approved + pending + rejected
    const sum = parseInt(metrics.approved) + parseInt(metrics.pending) + parseInt(metrics.rejected);
    const passed = parseInt(metrics.total) === sum;
    console.log(`  ${passed ? '✓' : '✗'} Arithmetic: ${metrics.total} = ${metrics.approved} + ${metrics.pending} + ${metrics.rejected} (${sum})`);

    // Verify invariant: approval rate formula
    const expectedRate = Math.round(100 * parseInt(metrics.approved) / parseInt(metrics.total));
    const rateCorrect = parseInt(metrics.approvalRate) === expectedRate;
    console.log(`  ${rateCorrect ? '✓' : '✗'} Approval Rate: ${metrics.approvalRate}% = 100 * ${metrics.approved} / ${metrics.total} (${expectedRate}%)`);

    // Test 2: Empty result
    console.log('\n📋 Test 2: Empty Result (2099-01-01 to 2099-12-31)');
    await page.fill('input[type="date"]:first-of-type', '2099-01-01');
    await page.fill('input[type="date"]:last-of-type', '2099-12-31');
    await page.click('button:has-text("Cargar métricas")');
    await page.waitForSelector('[data-empty="true"]', { timeout: 5000 }).catch(() => null);

    const isEmpty = await page.evaluate(() => {
      return document.querySelector('[data-empty="true"]') !== null;
    });
    console.log(`  ${isEmpty ? '✓' : '✗'} Empty state detected: data-empty="true"`);

    // Test 3: Export button
    console.log('\n📋 Test 3: Export Button Always Available');
    const exportBtn = await page.$('[data-action="export-csv"]');
    const isClickable = await page.evaluate(() => {
      const btn = document.querySelector('[data-action="export-csv"]');
      return !btn.disabled;
    });
    console.log(`  ${isClickable ? '✓' : '✗'} Export button is enabled: ${isClickable}`);

    // Test 4: Contract verification
    console.log('\n📋 Test 4: Contract Verification (DOM attributes)');
    const contractOk = await page.evaluate(() => {
      const checks = [
        { selector: '[data-verify="metrics-dashboard"]', name: 'root container' },
        { selector: '[data-metric="total"]', name: 'total metric' },
        { selector: '[data-metric="approval-rate"]', name: 'approval-rate metric' },
        { selector: '[data-metric="status-breakdown"]', name: 'status breakdown' },
        { selector: '[data-metric="avg-review-time"]', name: 'avg review time' },
        { selector: '[data-action="export-csv"]', name: 'export button' },
      ];

      const results = checks.map(c => ({
        ...c,
        found: document.querySelector(c.selector) !== null,
      }));

      return results;
    });

    contractOk.forEach(c => {
      console.log(`  ${c.found ? '✓' : '✗'} ${c.name}: ${c.selector}`);
    });

    console.log('\n✅ All verifications complete!');

  } catch (err) {
    console.error('\n❌ Verification failed:', err.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

verify().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
