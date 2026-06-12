const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

async function captureLighthouse() {
  const reportPath = path.join(__dirname, '..', 'docs', 'screenshots', 'lighthouse.html');
  const outputPath = path.join(__dirname, '..', 'docs', 'screenshots', 'lighthouse_report.png');

  if (!fs.existsSync(reportPath)) {
    console.error(`Lighthouse report not found at: ${reportPath}`);
    process.exit(1);
  }

  console.log('Launching browser to capture Lighthouse report...');
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 800 });

  const fileUrl = `file://${reportPath.replace(/\\/g, '/')}`;
  console.log(`Loading Lighthouse report from: ${fileUrl}`);
  
  await page.goto(fileUrl, { waitUntil: 'networkidle2' });
  
  // Wait for the gauge animations to complete
  await new Promise(resolve => setTimeout(resolve, 5000));

  // Take screenshot of the top scores area
  // The Lighthouse gauge container typically has class .lh-scores-header or similar.
  // We can capture the full viewport which will contain the gauges.
  await page.screenshot({ path: outputPath });
  console.log(`Saved Lighthouse screenshot: ${outputPath}`);

  await browser.close();
}

captureLighthouse().catch(err => {
  console.error('Error capturing Lighthouse report:', err);
  process.exit(1);
});
