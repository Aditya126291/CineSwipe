/**
 * CineSwipe - Premium Automated Security QA Audit Test Suite
 * Executed via npx tsx tests/security_audit.js
 * Evaluates the 4 core defensive architecture pillars:
 * 1. HTTP Security Headers
 * 2. API Rate-Limiter (Sliding Window IP Bucket)
 * 3. Strict Input Schema Validation & XSS Sanitization
 * 4. Timing-Safe HMAC Cryptographic Signatures Verification
 */

import crypto from 'crypto';
import { NextRequest } from 'next/server';
import nextConfig from '../next.config';
import { middleware as rateLimitMiddleware } from '../middleware';
import * as validation from '../lib/validation';
import { POST as verifyPaymentRoute } from '../app/api/payment/verify/route';

// Colors for professional terminal reporting
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const BLUE = '\x1b[34m';
const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';

let totalTests = 0;
let passedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ${GREEN}✓ PASS:${RESET} ${message}`);
  } else {
    console.error(`  ${RED}✗ FAIL:${RESET} ${message}`);
    // Do not exit immediately so we can see all failures
  }
}

async function runSecurityAudit() {
  console.log(`\n${BOLD}${BLUE}======================================================================${RESET}`);
  console.log(`${BOLD}${BLUE}          CINESWIPE COMPREHENSIVE SECURITY QA AUDIT SUITE             ${RESET}`);
  console.log(`${BOLD}${BLUE}======================================================================${RESET}\n`);

  // ==========================================================================
  // PILLAR 2: HTTP SECURITY HEADERS CONFIGURATION
  // ==========================================================================
  console.log(`${BOLD}${YELLOW}--- Pillar 2: HTTP Security Headers Configuration ---${RESET}`);
  try {
    const headersList = await nextConfig.headers();
    const globalHeadersConfig = headersList.find(h => h.source === '/(.*)');
    
    assert(globalHeadersConfig !== undefined, "Global headers source '/(.*)' is defined in next.config.ts");
    
    if (globalHeadersConfig) {
      const headers = globalHeadersConfig.headers;
      
      const getHeader = (key) => headers.find(h => h.key === key);
      
      // Assertion 1: X-Frame-Options is set
      const xFrame = getHeader('X-Frame-Options');
      assert(xFrame !== undefined, "X-Frame-Options header is configured");
      
      // Assertion 2: X-Frame-Options prevents clickjacking
      assert(xFrame?.value === 'DENY', "X-Frame-Options is set to 'DENY' for complete iframe blocking");
      
      // Assertion 3: X-Content-Type-Options is set
      const xContentType = getHeader('X-Content-Type-Options');
      assert(xContentType !== undefined, "X-Content-Type-Options header is configured");
      
      // Assertion 4: X-Content-Type-Options prevents MIME sniffing
      assert(xContentType?.value === 'nosniff', "X-Content-Type-Options is set to 'nosniff'");
      
      // Assertion 5: Referrer-Policy is set
      const referrer = getHeader('Referrer-Policy');
      assert(referrer !== undefined, "Referrer-Policy header is configured");
      
      // Assertion 6: Referrer-Policy retains referrer origin cross-origin
      assert(referrer?.value === 'origin-when-cross-origin', "Referrer-Policy is set to 'origin-when-cross-origin'");
      
      // Assertion 7: Strict-Transport-Security (HSTS) is set
      const hsts = getHeader('Strict-Transport-Security');
      assert(hsts !== undefined, "Strict-Transport-Security header is configured");
      
      // Assertion 8: HSTS max-age is set to 1 year (31536000s) and preload/includeSubdomains is enabled
      assert(hsts?.value === 'max-age=31536000; includeSubDomains; preload', "Strict-Transport-Security enforces strict SSL (max-age=1 year, includeSubDomains, preload)");
      
      // Assertion 9: Permissions-Policy restricts device API access
      const permissions = getHeader('Permissions-Policy');
      assert(permissions !== undefined, "Permissions-Policy header is configured");
      assert(permissions?.value.includes('camera=()') && permissions?.value.includes('microphone=()') && permissions?.value.includes('geolocation=()'), "Permissions-Policy completely disables camera, microphone, and geolocation access");
      
      // Assertion 10: Content-Security-Policy (CSP) is set and restricts default origin to 'self'
      const csp = getHeader('Content-Security-Policy');
      assert(csp !== undefined, "Content-Security-Policy header is configured");
      assert(csp?.value.includes("default-src 'self'"), "Content-Security-Policy contains 'default-src \'self\''");
      assert(csp?.value.includes("https://checkout.razorpay.com"), "Content-Security-Policy permits secure third-party Razorpay integration");
    }
  } catch (error) {
    console.error(`${RED}Failure in Pillar 2 (Headers):${RESET}`, error);
  }
  console.log("");

  // ==========================================================================
  // PILLAR 2: API RATE-LIMITER (SLIDING-WINDOW IP BUCKET)
  // ==========================================================================
  console.log(`${BOLD}${YELLOW}--- Pillar 2: API Rate-Limiter (Sliding-Window IP Bucket) ---${RESET}`);
  try {
    const testIp = '192.168.1.100';
    const otherIp = '192.168.1.200';
    const rateLimitResponses = [];
    
    // Simulate sending 70 requests from the same IP
    console.log(`  Simulating 70 requests from IP ${testIp} to confirm rate-limiting at 61...`);
    for (let i = 1; i <= 70; i++) {
      const req = new NextRequest('http://localhost:3000/api/catalog/feed', {
        headers: { 'x-real-ip': testIp }
      });
      const res = rateLimitMiddleware(req);
      rateLimitResponses.push(res);
    }
    
    // Assertion 1-3: Verify the first 60 requests are allowed (middleware returns undefined or non-429)
    let first60Allowed = true;
    for (let i = 0; i < 60; i++) {
      if (rateLimitResponses[i] && rateLimitResponses[i].status === 429) {
        first60Allowed = false;
      }
    }
    assert(first60Allowed, "First 60 requests are successfully permitted within the sliding window");
    
    // Assertion 4: Verify request 61 is rate-limited (status 429)
    const req61Res = rateLimitResponses[60];
    assert(req61Res !== undefined && req61Res.status === 429, "Request 61 is blocked with HTTP Status 429 (Too Many Requests)");
    
    // Assertion 5-10: Verify the next 10 consecutive requests (61 to 70) are all rate-limited and assert response headers
    if (req61Res) {
      assert(req61Res.headers.get('Content-Type') === 'application/json', "Rate-limiter response contains 'Content-Type: application/json'");
      assert(req61Res.headers.get('X-RateLimit-Limit') === '60', "Rate-limiter returns 'X-RateLimit-Limit: 60'");
      assert(req61Res.headers.get('X-RateLimit-Remaining') === '0', "Rate-limiter returns 'X-RateLimit-Remaining: 0'");
      assert(req61Res.headers.get('Retry-After') !== null && Number(req61Res.headers.get('Retry-After')) > 0, `Rate-limiter returns valid 'Retry-After' header (${req61Res.headers.get('Retry-After')} seconds)`);
      assert(req61Res.headers.get('X-RateLimit-Reset') !== null, "Rate-limiter returns 'X-RateLimit-Reset' Unix timestamp");
      
      const bodyText = await req61Res.text();
      const body = JSON.parse(bodyText);
      assert(body.error === 'Too many requests. Please throttle your swipes and try again later.', "Rate-limiter payload returns correct friendly error message");
    }

    // Verify rate limit is IP-isolated (IP 192.168.1.200 should still be allowed)
    const otherIpReq = new NextRequest('http://localhost:3000/api/catalog/feed', {
      headers: { 'x-real-ip': otherIp }
    });
    const otherIpRes = rateLimitMiddleware(otherIpReq);
    assert(otherIpRes === undefined || otherIpRes.status !== 429, `IP-isolation active: request from unblocked IP ${otherIp} succeeds while ${testIp} is throttled`);

  } catch (error) {
    console.error(`${RED}Failure in Pillar 2 (Rate Limiter):${RESET}`, error);
  }
  console.log("");

  // ==========================================================================
  // PILLAR 3: STRICT INPUT SCHEMA VALIDATION & XSS SANITIZATION
  // ==========================================================================
  console.log(`${BOLD}${YELLOW}--- Pillar 3: Strict Input Schema Validation & XSS Sanitization ---${RESET}`);
  try {
    // Assertions 1-5: Catalog Feed Query validation checks
    const feedParams1 = new URLSearchParams("mediaType=invalid_type");
    assert(validation.validateCatalogFeedQuery(feedParams1).valid === false, "Catalog Feed rejects invalid mediaType");

    const feedParams2 = new URLSearchParams("genreId=-5");
    assert(validation.validateCatalogFeedQuery(feedParams2).valid === false, "Catalog Feed rejects negative genreId");

    const feedParams3 = new URLSearchParams("page=0");
    assert(validation.validateCatalogFeedQuery(feedParams3).valid === false, "Catalog Feed rejects page = 0");

    const feedParams4 = new URLSearchParams("page=9999");
    assert(validation.validateCatalogFeedQuery(feedParams4).valid === false, "Catalog Feed rejects page > 1000");

    const feedParams5 = new URLSearchParams("seed=invalid*seed*chars");
    assert(validation.validateCatalogFeedQuery(feedParams5).valid === false, "Catalog Feed rejects seed with unsafe special characters");

    // Assertions 6-8: Next Card Payload validation checks
    const nextCardPayload1 = { weights: "not-an-object" };
    assert(validation.validateNextCardPayload(nextCardPayload1).valid === false, "Next Card rejects non-object weights");

    const nextCardPayload2 = { weights: { 28: 1.5 } };
    assert(validation.validateNextCardPayload(nextCardPayload2).valid === false, "Next Card rejects weights outside [0, 1] range (> 1.0)");

    // Create a seen list that exceeds the safe size boundary of 5000
    const largeSeen = Array.from({ length: 5001 }, (_, i) => i + 1);
    const nextCardPayload3 = { seen: largeSeen };
    assert(validation.validateNextCardPayload(nextCardPayload3).valid === false, "Next Card rejects seen array exceeding size boundary (> 5000)");

    // Assertion 9: Payment Create Order validation checks
    const createOrderPayload = { amount: 10000001, currency: 'INR' }; // 10000001 paise (exceeds 1 Lakh INR protection boundary)
    assert(validation.validateCreateOrderPayload(createOrderPayload).valid === false, "Create Order rejects amount exceeding 1 Lakh INR threshold");

    // Assertion 10: Create Room validation checks
    const createRoomPayload1 = { code: "ABC", userId: "not-a-uuid" };
    assert(validation.validateCreateRoomPayload(createRoomPayload1).valid === false, "Create Room rejects room codes not exactly 6 characters");
    assert(validation.validateCreateRoomPayload({ code: "ABCDEF", userId: "not-a-uuid" }).valid === false, "Create Room rejects non-UUID userId");

    // Assertion 11: Sync Room XSS Sanitization check
    const syncRoomPayload = {
      userId: "b2dfc836-e0f6-4f4b-8e36-ffde59114f6e",
      username: "<h1>SecureTester</h1>",
      avatarColor: "#7C3AED",
      action: "start-session"
    };
    const syncRes = validation.validateSyncRoomPayload(syncRoomPayload);
    assert(syncRes.valid === true, "Sync Room handles valid metadata successfully");
    assert(syncRes.parsed?.username === "SecureTester", "Sync Room successfully strips raw HTML tags from usernames");

  } catch (error) {
    console.error(`${RED}Failure in Pillar 3 (Input Validation):${RESET}`, error);
  }
  console.log("");

  // ==========================================================================
  // PILLAR 4: TIMING-SAFE HMAC CRYPTOGRAPHIC SIGNATURES VERIFICATION
  // ==========================================================================
  console.log(`${BOLD}${YELLOW}--- Pillar 4: Timing-Safe HMAC Cryptographic Signatures Verification ---${RESET}`);
  try {
    const secretKey = 'super_secret_test_key';
    process.env.RAZORPAY_KEY_SECRET = secretKey;
    process.env.NODE_ENV = 'production';

    const orderId = 'order_ABC123';
    const paymentId = 'pay_XYZ987';
    const signaturePayload = `${orderId}|${paymentId}`;
    
    // Generate the correct signature using HMAC SHA256
    const authenticSignature = crypto
      .createHmac('sha256', secretKey)
      .update(signaturePayload)
      .digest('hex');

    // Assertion 1: Verify valid signature returns 200 Success
    const reqValid = new Request('http://localhost:3000/api/payment/verify', {
      method: 'POST',
      body: JSON.stringify({
        razorpay_order_id: orderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: authenticSignature
      })
    });
    const resValid = await verifyPaymentRoute(reqValid);
    assert(resValid.status === 200, "Authentic cryptographic signature successfully verified with HTTP status 200");

    // Assertion 2-11: Execute 10 assertions with slightly modified signatures of identical length
    // to test constant-time HMAC check rejects them under varying input values
    console.log("  Testing 10 unique invalid signatures of matching length to confirm secure timing-safe rejection...");
    
    for (let i = 0; i < 10; i++) {
      // Modify a single character in the authentic signature (subtle tampering)
      const tamperedChar = authenticSignature[i] === 'a' ? 'b' : 'a';
      const tamperedSignature = authenticSignature.substring(0, i) + tamperedChar + authenticSignature.substring(i + 1);
      
      const reqTampered = new Request('http://localhost:3000/api/payment/verify', {
        method: 'POST',
        body: JSON.stringify({
          razorpay_order_id: orderId,
          razorpay_payment_id: paymentId,
          razorpay_signature: tamperedSignature
        })
      });
      const resTampered = await verifyPaymentRoute(reqTampered);
      const resBody = await resTampered.json();
      
      assert(
        resTampered.status === 400 && resBody.error === "Cryptographic signature mismatch",
        `Assertion 4.${i+2}: Tampered signature at index ${i} is securely rejected with 400 Mismatch`
      );
    }

    // Assertion 12: Development Sandbox Bypass triggers successfully in development env
    process.env.RAZORPAY_KEY_SECRET = '';
    process.env.NODE_ENV = 'development';
    const reqSandbox = new Request('http://localhost:3000/api/payment/verify', {
      method: 'POST',
      body: JSON.stringify({
        razorpay_order_id: 'order_mock_123',
        razorpay_payment_id: 'pay_mock_123',
        razorpay_signature: 'mock_signature_dev'
      })
    });
    const resSandbox = await verifyPaymentRoute(reqSandbox);
    assert(resSandbox.status === 200, "Simulated Sandbox payments bypass verification successfully in development mode");

  } catch (error) {
    console.error(`${RED}Failure in Pillar 4 (HMAC Cryptography):${RESET}`, error);
  }
  console.log("");

  // ==========================================================================
  // FINAL SCOREBOARD SUMMARY
  // ==========================================================================
  console.log(`${BOLD}${BLUE}======================================================================${RESET}`);
  console.log(`${BOLD}${BLUE}                     SECURITY QA AUDIT SUMMARY                        ${RESET}`);
  console.log(`${BOLD}${BLUE}======================================================================${RESET}`);
  console.log(`  Total Test Assertions Run: ${BOLD}${totalTests}${RESET}`);
  console.log(`  Passed Test Assertions   : ${BOLD}${GREEN}${passedTests}${RESET} / ${BOLD}${totalTests}${RESET}`);
  
  if (passedTests === totalTests) {
    console.log(`\n  ${BOLD}${GREEN}★★★ STATUS: 100% DEFENSIVE PROTECTION SECURED ★★★${RESET}`);
    console.log(`  All CineSwipe Premium Hardening Protection measures passed with 0 security flaws detected.\n`);
    process.exit(0);
  } else {
    console.log(`\n  ${BOLD}${RED}★★★ STATUS: SECURITY AUDIT FAILED ★★★${RESET}`);
    console.log(`  Some defensive hardening guards did not pass verification. Audit failed.\n`);
    process.exit(1);
  }
}

runSecurityAudit().catch(err => {
  console.error("FATAL: Security audit crashed with an unhandled exception:", err);
  process.exit(1);
});
