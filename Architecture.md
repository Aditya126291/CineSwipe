# CineSwipe Application

You are a senior full-stack engineer. Your task is to build "CineSwipe," a responsive web application optimized for both mobile phones and desktop PCs. The application allows individuals to surf movies solo or join real-time multiplayer rooms using room codes to swipe and match on movies with friends.

---

## 1. DUAL SYSTEM USER MODES
The system must dynamically handle two operational states based on the user's choice:
*   **Solo Mode:** A user immediately accesses the swiping deck to browse movies based on personal preferences. Swipes are saved locally or directly to their profile history without any room synchronization.
*   **Multiplayer Room Mode:** 
    *   *Host:* Generates a unique 6-character alphanumerical room code (e.g., 'MZ94X7').
    *   *Guest:* Enters a valid 6-character room code to join the session.
    *   *Sync:* All swipes inside the room are cross-referenced in real-time. If all users in the active room swipe 'like' on the same movie, a match is triggered.

---

## 2. CROSS-PLATFORM INTERACTION DECK (FRONT & BACK FLIP)

Build a fully responsive `SwipeDeck` component that supports both touch drag events (mobile) and mouse click/drag actions (PC desktop).

### Card Interactions & Mechanics:
1.  **The Deck Layer:** Stack a minimum of 3 cards absolute-centered on top of each other. The layout must handle wide PC monitors gracefully without stretching the poster graphics.
2.  **The Front (Overview Status):** Displays high-resolution movie poster art, titles, genres, and a short description. Swiping right triggers a 'Like' callback; swiping left triggers a 'Dislike' callback.
3.  **The 3D Flip Action (The Video Core):** Tapping or clicking the movie card initiates a horizontal Y-axis 3D flip animation using Framer Motion (`rotateY: 180`).
4.  **The Back (Media Status):** 
    *   Mounts an embedded, lightweight YouTube Player playing the official movie trailer.
    *   Displays direct local streaming provider availability icons (Netflix, Prime, Disney+).
    *   *Important Constraint:* When the card is flipped to the back, physics-based dragging must be entirely disabled so users can select and pause the video player without accidentally throwing the card away.
    *   Includes a prominent 'Close' or 'Flip Back' button to return to the front and resume swiping.

---

## 3. DATABASE SCHEMA & STREAMING INTEGRATION

### Supabase Relational Database Setup:
*   `rooms`: id (UUID), created_by (User ID), code (VARCHAR(6)), status (active/closed).
*   `room_members`: room_id, user_id (Composite Primary Key).
*   `swipes`: user_id, room_id (nullable for solo surfing), movie_id, direction (like/dislike).

### Real-Time Listeners:
Implement a Supabase Realtime channel listener for multiplayer sessions. When a user inserts a 'like' swipe row, evaluate if it matches across all room members. If true, instantly broadcast a real-time message payload to all active client sockets in that room to trigger an "It's a Match!" celebration modal.

### Data Ingestion Strategy:
Use the TMDB API to populate the database cache. Collect the standard movie overview details, fetch the YouTube trailer keys, and query the local watch provider data to display exact deep links to regional streaming platforms.

---

## 4. CODE PREFERENCES
*   Language: Next.js (App Router), TypeScript, Tailwind CSS, Framer Motion, and Supabase.
*   Ensure smooth 60fps card transformations and prevent memory leaks when the embedded video iframe players are unmounted during a card swipe.
