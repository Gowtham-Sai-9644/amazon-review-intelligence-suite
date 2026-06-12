const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const PAGES = [
  { name: 'landing', path: '/' },
  { name: 'analyzer', path: '/analyzer' },
  { name: 'analytics', path: '/analytics' },
  { name: 'explain', path: '/explain' },
  { name: 'insights', path: '/insights' },
  { name: 'evaluation', path: '/evaluation' }
];

async function capture() {
  const outputDir = path.join(__dirname, '..', 'docs', 'screenshots');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
    console.log(`Created directory: ${outputDir}`);
  }

  console.log('Launching headless browser...');
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  // Set consistent viewport
  await page.setViewport({ width: 1440, height: 900 });

  for (const item of PAGES) {
    const url = `http://localhost:3000${item.path}`;
    console.log(`Navigating to ${url}...`);
    try {
      // Wait for network idle to ensure charts and content load
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 15000 });
      // Extra delay for dynamic count-ups/animations to settle
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      const filePath = path.join(outputDir, `${item.name}.png`);
      await page.screenshot({ path: filePath });
      console.log(`Saved screenshot: ${filePath}`);
    } catch (err) {
      console.error(`Failed to capture ${item.name}: ${err.message}`);
    }
  }

  await browser.close();
  console.log('Screenshots capture complete!');
}

capture();
