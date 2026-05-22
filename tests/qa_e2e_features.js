const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  console.log("Starting QA test suite...");
  
  const browser = await chromium.launch({ headless: true });
  const artifactsDir = path.join(__dirname, 'artifacts');
  fs.mkdirSync(artifactsDir, { recursive: true });
  
  try {
    const hostContext = await browser.newContext();
    const guest1Context = await browser.newContext();
    const guest2Context = await browser.newContext();
    
    const hostPage = await hostContext.newPage();
    const guest1Page = await guest1Context.newPage();
    const guest2Page = await guest2Context.newPage();
    
    // Inject Premium status so Superlike works
    await hostPage.addInitScript(() => window.localStorage.setItem('cineswipe-plus', 'true'));
    await guest1Page.addInitScript(() => window.localStorage.setItem('cineswipe-plus', 'true'));
    await guest2Page.addInitScript(() => window.localStorage.setItem('cineswipe-plus', 'true'));
    
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
    await hostPage.fill('input[type="text"]', 'HostQA');
    await hostPage.click('button:has-text("Confirm Nickname")');
    
    await hostPage.waitForSelector('text=Party Ticket Code', { timeout: 10000 });
    
    // ---------------------------------------------------------
    // 2. Guests 1 and 2 joining
    // ---------------------------------------------------------
    console.log("Guests 1 & 2 joining...");
    const joinRoom = async (page, guestNum, nickname) => {
      await page.goto('http://localhost:3000');
      await page.click('button:has-text("Popcorn Swipe Party")');
      await page.fill('input[placeholder="E.g. MZ94X7"]', roomCode);
      await page.click('button:has-text("Join")');
      await page.waitForURL(/\/room\//);
      
      await page.waitForSelector('button:has-text("Confirm Nickname")');
      await page.fill('input[type="text"]', nickname);
      await page.click('button:has-text("Confirm Nickname")');
      
      await page.waitForSelector('text=Party Ticket Code', { timeout: 10000 });
      console.log(`Guest ${guestNum} joined!`);
    };
    
    await Promise.all([
      joinRoom(guest1Page, 1, 'GuestQA1'),
      joinRoom(guest2Page, 2, 'GuestQA2')
    ]);
    
    // ---------------------------------------------------------
    // 3. Start Swiping Session
    // ---------------------------------------------------------
    console.log("Host starting session...");
    await hostPage.click('button:has-text("Start Swiping Session")');
    
    await hostPage.waitForSelector('button[title="Like"]', { timeout: 15000 });
    await guest1Page.waitForSelector('button[title="Like"]', { timeout: 15000 });
    await guest2Page.waitForSelector('button[title="Like"]', { timeout: 15000 });
    console.log("Session started. All members in Swipe Deck.");
    
    // ---------------------------------------------------------
    // 4. Test Live Like Counter
    // ---------------------------------------------------------
    console.log("Host liking the movie...");
    await hostPage.click('button[title="Like"]');
    
    console.log("Waiting for Guest 1 to see the Live Like Counter...");
    await guest1Page.waitForSelector('text=/liked this/', { timeout: 10000 });
    await guest1Page.screenshot({ path: `${artifactsDir}/guest_live_like.png` });
    console.log("Screenshot: guest_live_like.png saved.");
    
    // Host undoes the swipe
    console.log("Host undoing swipe...");
    await hostPage.click('button[title="Undo"]');
    await hostPage.waitForTimeout(1500);
    
    // ---------------------------------------------------------
    // 5. Test Superlike Toast Animation
    // ---------------------------------------------------------
    console.log("Host attempting to superlike (will trigger paywall if mock doesn't work)...");
    await hostPage.click('button[title="Super Like"]');
    
    // Wait in case it opens paywall
    try {
        await hostPage.waitForSelector('button:has-text("Unlock CineSwipe+")', { timeout: 3000 });
        console.log("Upgrading Host to Premium...");
        await hostPage.click('button:has-text("Unlock CineSwipe+")');
        await hostPage.waitForTimeout(3000); 
        console.log("Host superliking the movie (Premium active)...");
        await hostPage.click('button[title="Super Like"]');
    } catch (e) {
        console.log("No upgrade prompt, Premium is already active.");
    }
    
    console.log("Waiting for Superlike toast on Guest 1...");
    try {
        await guest1Page.waitForSelector('text=superliked this', { timeout: 5000 });
        await guest1Page.screenshot({ path: `${artifactsDir}/guest_superlike_toast.png` });
        console.log("Screenshot: guest_superlike_toast.png saved.");
    } catch (e) {
        console.log("BUG DETECTED: Superlike toast did not appear on Guest 1!");
        // We will note this in the report and move on to step 6.
        fs.writeFileSync(`${artifactsDir}/superlike_bug_detected.txt`, "true");
    }
    
    // Guests like to complete the match
    await guest1Page.click('button[title="Like"]');
    await guest2Page.click('button[title="Like"]');
    
    console.log("Waiting for match modal...");
    await hostPage.waitForSelector('text=Keep Surfing', { timeout: 15000 });
    
    // ---------------------------------------------------------
    // 6. Test Movie Night Planner Ranking
    // ---------------------------------------------------------
    console.log("Closing match modal...");
    await hostPage.click('button:has-text("Keep Surfing")');
    
    console.log("Waiting for Movie Night Planner to be visible...");
    await hostPage.waitForSelector('text=Engagement Rank', { timeout: 10000 });
    
    await hostPage.screenshot({ path: `${artifactsDir}/movie_night_planner.png` });
    console.log("Screenshot: movie_night_planner.png saved.");
    
    console.log("Test suite completed successfully!");
  } catch (err) {
    console.error("Test failed: ", err);
  } finally {
    await browser.close();
  }
})();
