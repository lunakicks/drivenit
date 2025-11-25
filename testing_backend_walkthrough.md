# Backend & Authentication Testing Walkthrough

This guide explains how to run the tests for the Authentication Service (`useAuthStore`) and backend integrations.

## 🚀 Running Tests

To run the backend/auth tests specifically:

```bash
npm test src/stores
```

## 🧪 Test Architecture

Since we use Supabase as a Backend-as-a-Service (BaaS), our "backend" testing focuses on the **Integration Layer**—the code that communicates with Supabase.

### Components
1.  **Auth Service (`useAuthStore.ts`)**: The central hub for user state, session management, and data persistence.
2.  **Supabase Mock (`src/test/supabaseMock.ts`)**: A test helper that simulates the Supabase client. This allows us to test our logic without making real network requests or requiring a running database.

## 📝 Test Scenarios

We cover the following critical flows:

### 1. Authentication Flows
- **Session Restoration:** Verifies that when the app loads, it correctly checks for an existing session and fetches the user's profile.
- **Sign Out:** Ensures local state is cleared and the Supabase `signOut` method is called.

### 2. Data Integrity & Business Logic
- **Profile Merging:** Checks that user auth data (email) is correctly merged with profile data (hearts, XP).
- **Business Rules:**
  - **Hearts Capping:** Verifies that hearts cannot exceed 5 or drop below 0.
  - **XP Calculation:** Verifies XP is added correctly.

### 3. Database Interactions
- **Optimistic Updates:** Verifies that the UI updates immediately (optimistic UI) before the DB call completes.
- **Persistence:** Verifies that the correct Supabase methods (`update`, `eq`) are called with the right data.

### 4. Error Handling
- **Graceful Failures:** Ensures that if the database update fails, the app doesn't crash and logs the error (in a real app, we might want to rollback the state).

## 🛠️ Extending Tests

To add more backend tests:
1.  Open `src/stores/__tests__/useAuthStore.test.ts`.
2.  Use `mockSupabase.from('table_name')` to mock specific table interactions.
3.  Use `act()` when calling store methods to ensure React state updates are handled correctly.
