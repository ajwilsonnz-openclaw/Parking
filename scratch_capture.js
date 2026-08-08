const puppeteer = require('puppeteer-core');
const http = require('http');
const path = require('path');

async function run() {
  try {
    const resText = await new Promise((resolve, reject) => {
      http.get('http://localhost:9222/json/version', (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve(data));
      }).on('error', reject);
    });

    const versionData = JSON.parse(resText);
    const browserWSEndpoint = versionData.webSocketDebuggerUrl;
    console.log('Connecting to Chrome CDP at:', browserWSEndpoint);

    const browser = await puppeteer.connect({
      browserWSEndpoint,
      defaultViewport: {
        width: 390,
        height: 844,
        deviceScaleFactor: 2,
        isMobile: true,
        hasTouch: true,
      }
    });

    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1');

    console.log('Navigating to http://localhost:3000...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });

    const artifactsDir = 'C:\\Users\\Adam\\.gemini\\antigravity\\brain\\452e4066-f75c-45a2-a265-460842fbf5f8';
    
    // Shot 1: Dashboard Park View
    const shot1 = path.join(artifactsDir, 'mobile_park_view.png');
    await page.screenshot({ path: shot1, fullPage: false });
    console.log('Saved mobile_park_view.png');

    // Shot 2: Verify View
    await page.evaluate(() => {
      const tabs = Array.from(document.querySelectorAll('button'));
      const verifyBtn = tabs.find(b => b.textContent.includes('Verify'));
      if (verifyBtn) verifyBtn.click();
    });
    await new Promise(r => setTimeout(r, 1000));
    const shot2 = path.join(artifactsDir, 'mobile_verify_view.png');
    await page.screenshot({ path: shot2, fullPage: false });
    console.log('Saved mobile_verify_view.png');

    // Shot 3: Account View
    await page.evaluate(() => {
      const tabs = Array.from(document.querySelectorAll('button'));
      const accBtn = tabs.find(b => b.textContent.includes('Account'));
      if (accBtn) accBtn.click();
    });
    await new Promise(r => setTimeout(r, 1000));
    const shot3 = path.join(artifactsDir, 'mobile_account_view.png');
    await page.screenshot({ path: shot3, fullPage: false });
    console.log('Saved mobile_account_view.png');

    await page.close();
    await browser.disconnect();
    console.log('Done capturing screenshots!');
  } catch (err) {
    console.error('Error running CDP capture:', err);
  }
}

run();
