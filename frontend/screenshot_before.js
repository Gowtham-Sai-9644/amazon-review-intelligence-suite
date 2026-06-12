const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const PAGES = [
  { name: 'before_landing', path: '/' },
  { name: 'before_analyzer', path: '/analyzer' },
  { name: 'before_analytics', path: '/analytics' }
];

async function captureBefore() {
  const outputDir = path.join(__dirname, '..', 'docs', 'screenshots');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log('Launching browser to capture "before" state...');
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  for (const item of PAGES) {
    const url = `http://localhost:3000${item.path}`;
    console.log(`Navigating to ${url}...`);
    try {
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 15000 });
      // Wait for any client-side rendering/data fetch
      await new Promise(resolve => setTimeout(resolve, 3000));
      const filePath = path.join(outputDir, `${item.name}.png`);
      await page.screenshot({ path: filePath });
      console.log(`Saved pre-redesign screenshot: ${filePath}`);
    } catch (err) {
      console.error(`Failed to capture ${item.name}: ${err.message}`);
    }
  }

  await browser.close();
  console.log('Pre-redesign screenshots complete!');
}

captureBefore().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
