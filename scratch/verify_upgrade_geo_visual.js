const { chromium } = require('playwright');

async function verifyGeoVisual() {
  console.log("=== Starting Dynamic Pricing E2E Visual Verification ===");
  const browser = await chromium.launch({ headless: true });
  
  try {
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // ---------------------------------------------------------
    // 1. Verify Indian Locale (geo=IN)
    // ---------------------------------------------------------
    console.log("Navigating to upgrade page simulating Indian region (?geo=IN)...");
    await page.goto('http://localhost:3000/upgrade?geo=IN');
    
    // Give state/hydration a brief moment to settle
    await page.waitForTimeout(1000);
    
    // Check if the slashed '$3' and active '₹99' are visible
    const isRupeeVisible = await page.isVisible('text=₹99');
    const isSlashedDollarVisible = await page.isVisible('text=$3');
    
    console.log(`  [IN Mode] Is Rupee price (₹99) visible? ${isRupeeVisible}`);
    console.log(`  [IN Mode] Is slashed Dollar ($3) visible? ${isSlashedDollarVisible}`);
    
    if (isRupeeVisible && isSlashedDollarVisible) {
      console.log("  [PASS] Indian regional pricing correctly displays ₹99 slashed from $3.");
    } else {
      throw new Error("Indian pricing layout verification failed!");
    }
    
    // ---------------------------------------------------------
    // 2. Verify International Locale (geo=US)
    // ---------------------------------------------------------
    console.log("Navigating to upgrade page simulating USA/International region (?geo=US)...");
    await page.goto('http://localhost:3000/upgrade?geo=US');
    await page.waitForTimeout(1000);
    
    const isDollarVisible = await page.isVisible('text=$3');
    const pageText = await page.innerText('body');
    const hasRupeeReference = pageText.includes('₹') || pageText.includes('Rupees') || pageText.includes('INR');
    
    console.log(`  [US Mode] Is Dollar price ($3) visible? ${isDollarVisible}`);
    console.log(`  [US Mode] Contains any Indian Rupee references? ${hasRupeeReference}`);
    
    if (isDollarVisible && !hasRupeeReference) {
      console.log("  [PASS] USA/International pricing correctly displays $3 and has ZERO INR mentions.");
    } else {
      throw new Error("International pricing layout verification failed!");
    }
    
    console.log("\n=== Dynamic Pricing visual layout verified successfully! ===");
    process.exit(0);
  } catch (err) {
    console.error("Visual regression test failed: ", err.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

// Settle server for a brief moment before launching E2E browser
setTimeout(verifyGeoVisual, 2000);
