const http = require('http');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

function fetch(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function verify() {
  console.log('Headless verification of MetricsDashboard contract\n');
  console.log(`Target: ${BASE_URL}`);

  let html;
  try {
    html = await fetch(BASE_URL);
  } catch (e) {
    console.error(`FAIL: Cannot reach ${BASE_URL} — ${e.message}`);
    console.error('Start the dev server first: npm start');
    process.exit(1);
  }

  const checks = [
    { name: 'HTML served', pass: html.includes('<div id="root">') || html.includes('<div id="root"></div>') },
    { name: 'React app bundle', pass: html.includes('/static/js/') },
  ];

  let failed = 0;
  checks.forEach(c => {
    console.log(`  ${c.pass ? 'PASS' : 'FAIL'}  ${c.name}`);
    if (!c.pass) failed++;
  });

  console.log('\nNote: Full DOM contract verification requires a browser runtime.');
  console.log('Use verify.mjs (Playwright) or the Browser pane for complete checks.');
  console.log(`\nResult: ${checks.length - failed}/${checks.length} passed\n`);

  process.exit(failed > 0 ? 1 : 0);
}

verify();
