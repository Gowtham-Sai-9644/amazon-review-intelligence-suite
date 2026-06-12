const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const MOBILE_PAGES = [
  { name: 'landing_mobile', path: '/' },
  { name: 'analyzer_mobile', path: '/analyzer' },
  { name: 'analytics_mobile', path: '/analytics' }
];

async function captureExtra() {
  const outputDir = path.join(__dirname, '..', 'docs', 'screenshots');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log('Launching headless browser...');
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // 1. Capture Mobile Views (375 x 812 viewport)
  await page.setViewport({ width: 375, height: 812, isMobile: true, hasTouch: true });
  for (const item of MOBILE_PAGES) {
    const url = `http://localhost:3000${item.path}`;
    console.log(`Navigating to mobile view: ${url}...`);
    try {
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 15000 });
      await new Promise(resolve => setTimeout(resolve, 2500));
      const filePath = path.join(outputDir, `${item.name}.png`);
      await page.screenshot({ path: filePath });
      console.log(`Saved screenshot: ${filePath}`);
    } catch (err) {
      console.error(`Failed to capture mobile ${item.name}: ${err.message}`);
    }
  }

  // 2. Capture Backend /health JSON Response
  await page.setViewport({ width: 1000, height: 600 });
  const healthUrl = 'https://aris-nlp-api.onrender.com/health';
  console.log(`Navigating to live backend: ${healthUrl}...`);
  try {
    await page.goto(healthUrl, { waitUntil: 'networkidle2', timeout: 15000 });
    await new Promise(resolve => setTimeout(resolve, 1000));
    const filePath = path.join(outputDir, 'health_response.png');
    await page.screenshot({ path: filePath });
    console.log(`Saved screenshot: ${filePath}`);
  } catch (err) {
    console.error(`Failed to capture health response: ${err.message}`);
  }

  await browser.close();
  console.log('Extra screenshots capture complete!');
}

captureExtra();
