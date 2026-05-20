'use client';

import { useState, useEffect } from 'react';
import { safeStorage } from '@/lib/storage';
import { supabase } from '@/lib/supabase/client';

export interface PremiumState {
  isPremium: boolean;
  dailySwipesLeft: number;
  maxDailySwipes: number;
  hasUsedFreeRoom: boolean;
}

// Helper to generate a valid RFC4122 v4 UUID
export function generateUUID(): string {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.randomUUID) {
    return window.crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Helper to validate UUID pattern
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

export function usePremium(userId?: string) {
  const [isPremium, setIsPremium] = useState<boolean>(false);
  const [swipeCount, setSwipeCount] = useState<number>(0);
  const [resolvedUserId, setResolvedUserId] = useState<string>('');
  const maxDailySwipes = 30;

  // Load initial premium state and swipe count
  useEffect(() => {
    // 1. Resolve or generate valid UUID
    let activeId = userId;
    if (!activeId) {
      activeId = safeStorage.getItem('cineswipe-user-id') || '';
    }
    
    if (!activeId || !isValidUUID(activeId)) {
      activeId = generateUUID();
      safeStorage.setItem('cineswipe-user-id', activeId);
    }
    
    setResolvedUserId(activeId);

    // 2. Check LocalStorage premium and swipe metrics
    const localPremium = safeStorage.getItem('cineswipe-plus') === 'true';
    setIsPremium(localPremium);

    const todayStr = new Date().toDateString();
    const storedDate = safeStorage.getItem('cineswipe-swipe-date');
    const storedCount = safeStorage.getItem('cineswipe-swipe-count');

    if (storedDate === todayStr && storedCount) {
      setSwipeCount(parseInt(storedCount, 10));
    } else {
      safeStorage.setItem('cineswipe-swipe-date', todayStr);
      safeStorage.setItem('cineswipe-swipe-count', '0');
      setSwipeCount(0);
    }

    // 3. If Supabase is available, upsert/sync user profile in DB to prevent FK violations
    if (supabase && activeId) {
      const initUserProfile = async () => {
        try {
          const { data, error } = await supabase!
            .from('users')
            .select('is_premium, daily_swipe_count, last_swipe_date')
            .eq('id', activeId)
            .single();

          const username = safeStorage.getItem('cineswipe-username') || 'Anonymous Surfer';
          const todayIso = new Date().toISOString().split('T')[0];

          if (error || !data) {
            // User doesn't exist yet, insert a profile row!
            const { data: insertedData } = await supabase!
              .from('users')
              .insert({
                id: activeId,
                username: username,
                is_premium: localPremium,
                daily_swipe_count: storedDate === todayStr && storedCount ? parseInt(storedCount, 10) : 0,
                last_swipe_date: todayIso
              })
              .select()
              .single();
            
            if (insertedData) {
              setIsPremium(insertedData.is_premium);
              safeStorage.setItem('cineswipe-plus', insertedData.is_premium ? 'true' : 'false');
            }
          } else {
            // User exists, sync states
            setIsPremium(data.is_premium);
            safeStorage.setItem('cineswipe-plus', data.is_premium ? 'true' : 'false');
            
            const dbDate = new Date(data.last_swipe_date).toDateString();
            if (dbDate === todayStr) {
              setSwipeCount(data.daily_swipe_count);
              safeStorage.setItem('cineswipe-swipe-count', data.daily_swipe_count.toString());
            }
          }
        } catch (err) {
          console.error('Error initializing user profile:', err);
        }
      };

      initUserProfile();
    }
  }, [userId]);

  const incrementSwipeCount = async () => {
    if (isPremium) return true; // Premium has unlimited swipes
    
    const newCount = swipeCount + 1;
    if (newCount > maxDailySwipes) {
      return false; // Limit exceeded
    }

    setSwipeCount(newCount);
    safeStorage.setItem('cineswipe-swipe-count', newCount.toString());

    const activeId = resolvedUserId || userId;
    if (supabase && activeId) {
      // Background update in DB
      await supabase.from('users').update({
        daily_swipe_count: newCount,
        last_swipe_date: new Date().toISOString().split('T')[0]
      }).eq('id', activeId);
    }

    return true;
  };

  const upgradeToPremium = async () => {
    setIsPremium(true);
    safeStorage.setItem('cineswipe-plus', 'true');

    const activeId = resolvedUserId || userId;
    if (supabase && activeId) {
      await supabase.from('users').update({
        is_premium: true,
        premium_purchased_at: new Date().toISOString()
      }).eq('id', activeId);
    }
  };

  // Trigger Razorpay payment (fully customisable, fallbacks to simulated checkout if Keys are missing)
  const triggerRazorpayCheckout = (onSuccess: () => void, onError: (err: any) => void) => {
    const amount = 9900; // Rs. 99 (9900 paise)
    const currency = 'INR';
    
    // Check if Razorpay script is loaded. If not, inject it
    const loadRazorpayScript = () => {
      return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
      });
    };

    const handlePayment = async () => {
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        alert('Failed to load payment gateway. Simulating sandbox payment...');
        // Sandbox checkout fallback
        setTimeout(() => {
          upgradeToPremium();
          onSuccess();
        }, 1500);
        return;
      }

      // Call API route to create order
      try {
        const response = await fetch('/api/payment/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount, currency }),
        });

        const orderData = await response.json();

        if (!response.ok || !orderData.id) {
          throw new Error(orderData.error || 'Failed to create order');
        }

        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_mockkey123',
          amount: orderData.amount,
          currency: orderData.currency,
          name: 'CineSwipe+',
          description: 'CineSwipe Premium Lifetime Unlock',
          image: '/favicon.ico',
          order_id: orderData.id,
          handler: async function (response: any) {
            // Verify payment
            const verifyRes = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();
            if (verifyRes.ok && verifyData.success) {
              await upgradeToPremium();
              onSuccess();
            } else {
              onError(verifyData.error || 'Payment verification failed');
            }
          },
          prefill: {
            name: 'Cinema Lover',
            email: 'hello@cineswipe.app',
            contact: '9999999999',
          },
          notes: {
            address: 'CineSwipe Headquarters',
          },
          theme: {
            color: '#7c3aed', // Electric violet
          },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.on('payment.failed', function (resp: any) {
          onError(resp.error);
        });
        rzp.open();
      } catch (err: any) {
        console.error('Razorpay initialization error:', err);
        // Simulated checkout for sandbox testing if server routes are not configured yet
        alert('Simulating premium payment bypass in sandbox mode...');
        setTimeout(() => {
          upgradeToPremium();
          onSuccess();
        }, 1200);
      }
    };

    handlePayment();
  };

  return {
    isPremium,
    swipeCount,
    swipesLeft: Math.max(0, maxDailySwipes - swipeCount),
    maxDailySwipes,
    incrementSwipeCount,
    upgradeToPremium,
    triggerRazorpayCheckout,
  };
}
