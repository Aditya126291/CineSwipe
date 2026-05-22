const { chromium } = require('playwright');

(async () => {
  console.log("Starting QA test suite...");
  
  const browser = await chromium.launch({ headless: true });
  const path = require('path');
  const fs = require('fs');
  const artifactsDir = path.join(__dirname, 'artifacts');
  fs.mkdirSync(artifactsDir, { recursive: true });
  
  try {
    const hostContext = await browser.newContext();
    const guest1Context = await browser.newContext();
    const guest2Context = await browser.newContext();
    const guest3Context = await browser.newContext();
    
    const hostPage = await hostContext.newPage();
    const guest1Page = await guest1Context.newPage();
    const guest2Page = await guest2Context.newPage();
    const guest3Page = await guest3Context.newPage();

    hostPage.on('console', msg => console.log('[Host Console]', msg.text()));
    guest1Page.on('console', msg => console.log('[Guest1 Console]', msg.text()));
    guest2Page.on('console', msg => console.log('[Guest2 Console]', msg.text()));
    
    hostPage.on('pageerror', err => console.error('[Host Error]', err.message));
    guest1Page.on('pageerror', err => console.error('[Guest1 Error]', err.message));
    guest2Page.on('pageerror', err => console.error('[Guest2 Error]', err.message));
    
    // ---------------------------------------------------------
    // 1. Room Creation
    // ---------------------------------------------------------
    console.log("Host creating room...");
    await hostPage.goto('http://localhost:3000');
    
    await hostPage.click('button:has-text("Popcorn Swipe Party")');
    await hostPage.click('button:has-text("Host Room Party")');
    
    await hostPage.waitForURL(/\/room\/[A-Z0-9]{6}/);
    const urlObj = new URL(hostPage.url());
    const roomCode = urlObj.pathname.split('/').pop();
    console.log(`Room created: ${roomCode}`);
    
    // Host confirms nickname
    console.log("Host confirming nickname...");
    await hostPage.waitForSelector('button:has-text("Confirm Nickname")');
    await hostPage.click('button:has-text("Confirm Nickname")');
    
    // Wait for the lobby to load
    await hostPage.waitForSelector('text=Party Ticket Code', { timeout: 10000 });
    
    // ---------------------------------------------------------
    // 2. Guests 1 and 2 joining
    // ---------------------------------------------------------
    console.log("Guests 1 & 2 joining...");
    const joinRoom = async (page, guestNum) => {
      await page.goto('http://localhost:3000');
      await page.click('button:has-text("Popcorn Swipe Party")');
      await page.fill('input[placeholder="E.g. MZ94X7"]', roomCode);
      await page.locator('form button[type="submit"]').click();
      await page.waitForURL(/\/room\/[A-Z0-9]{6}/, { timeout: 45000 });
      
      // Guest confirms nickname
      await page.waitForSelector('button:has-text("Confirm Nickname")');
      await page.click('button:has-text("Confirm Nickname")');
      
      await page.waitForSelector('text=Party Ticket Code', { timeout: 10000 });
      console.log(`Guest ${guestNum} joined!`);
    };
    
    await Promise.all([
      joinRoom(guest1Page, 1),
      joinRoom(guest2Page, 2)
    ]);
    
    await hostPage.waitForTimeout(2000);
    await hostPage.screenshot({ path: `${artifactsDir}/host_lobby.png` });
    await guest1Page.screenshot({ path: `${artifactsDir}/guest1_lobby.png` });
    console.log("Screenshot: host_lobby.png and guest1_lobby.png saved.");
    
    // ---------------------------------------------------------
    // 3. Test Lobby Capacity Paywall Bypass (Guest 3 joins)
    // ---------------------------------------------------------
    console.log("Guest 3 attempting to join (should fail)...");
    await guest3Page.goto('http://localhost:3000');
    await guest3Page.click('button:has-text("Popcorn Swipe Party")');
    await guest3Page.fill('input[placeholder="E.g. MZ94X7"]', roomCode);
    await guest3Page.click('button:has-text("Join")');
    
    await guest3Page.waitForTimeout(1000);
    
    // If it navigates to room, it's a bug! Or if it shows an error message, it's correct!
    // The capacity fix might block them in the home page API route, or in the room page.
    if (guest3Page.url().includes('/room')) {
       try {
           await guest3Page.waitForSelector('button:has-text("Confirm Nickname")', { timeout: 3000 });
           await guest3Page.click('button:has-text("Confirm Nickname")');
       } catch (e) {
           // Maybe it directly showed "Room Not Found" or "Room is Full"
       }
    }
    
    await guest3Page.waitForTimeout(2000);
    await guest3Page.screenshot({ path: `${artifactsDir}/guest3_rejected.png` });
    console.log("Screenshot: guest3_rejected.png saved.");
    
    // ---------------------------------------------------------
    // 4. Test Duplicate Swipe Match Flaw
    // ---------------------------------------------------------
    console.log("Host starting session...");
    await hostPage.click('button:has-text("Start Swiping Session")');
    
    await hostPage.waitForSelector('button[title="Like"]', { timeout: 15000 });
    await guest1Page.waitForSelector('button[title="Like"]', { timeout: 15000 });
    await guest2Page.waitForSelector('button[title="Like"]', { timeout: 15000 });
    console.log("Session started. All members in Swipe Deck.");
    
    console.log("Host liking the movie...");
    await hostPage.click('button[title="Like"]');
    await hostPage.waitForTimeout(2000);
    
    console.log("Host undoing swipe...");
    await hostPage.click('button[title="Undo"]');
    await hostPage.waitForTimeout(2000);
    
    console.log("Host liking the movie AGAIN (Duplicate entry)...");
    await hostPage.click('button[title="Like"]');
    await hostPage.waitForTimeout(2000);
    
    // Check if Match Modal is on the screen prematurely
    const isMatchModalPremature = await hostPage.isVisible('text=Keep Surfing');
    if (isMatchModalPremature) {
      console.log("BUG: Premature match modal detected on host!");
    } else {
      console.log("SUCCESS: No premature match modal on host.");
    }
    await hostPage.screenshot({ path: `${artifactsDir}/host_no_premature_match.png` });
    console.log("Screenshot: host_no_premature_match.png saved.");
    
    console.log("Guests 1 & 2 liking the movie...");
    await guest1Page.click('button[title="Like"]');
    await guest2Page.click('button[title="Like"]');
    
    console.log("Waiting for match modal...");
    // The legit match should now show up
    await hostPage.waitForSelector('text=Keep Surfing', { timeout: 15000 });
    await hostPage.waitForTimeout(1000); // Let animation settle
    await hostPage.screenshot({ path: `${artifactsDir}/host_legit_match.png` });
    console.log("Screenshot: host_legit_match.png saved.");
    
    console.log("Test suite completed successfully!");
  } catch (err) {
    console.error("Test failed: ", err);
  } finally {
    await browser.close();
  }
})();
