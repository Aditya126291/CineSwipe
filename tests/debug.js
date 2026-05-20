const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const hostContext = await browser.newContext();
  const hostPage = await hostContext.newPage();
  
  await hostPage.goto('http://localhost:3000');
  await hostPage.click('button:has-text("Popcorn Swipe Party")');
  await hostPage.click('button:has-text("Host Room Party")');
  
  await hostPage.waitForURL(/\/room\/[A-Z0-9]{6}/);
  console.log("Navigated to room. Waiting 5 seconds...");
  await hostPage.waitForTimeout(5000);
  
  const html = await hostPage.content();
  fs.writeFileSync('C:\\Users\\Aditya Kumar\\.gemini\\antigravity\\brain\\a28c4fa8-9a7c-488c-8d70-d794170bb04d/room_debug.html', html);
  await hostPage.screenshot({ path: 'C:\\Users\\Aditya Kumar\\.gemini\\antigravity\\brain\\a28c4fa8-9a7c-488c-8d70-d794170bb04d/room_debug.png' });
  console.log("Saved debug html and screenshot.");
  await browser.close();
})();
