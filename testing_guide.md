# 🧪 Testing Guide

This guide explains how to add new tests to the project. We use **Jest** and **React Testing Library**.

## 📂 Where to Place Tests

- **Components**: Create a `__tests__` folder inside the component's directory.
  - Example: `src/components/profile/__tests__/MyComponent.test.tsx`
- **Stores/Logic**: Create a `__tests__` folder inside the store/hook directory.
  - Example: `src/stores/__tests__/myStore.test.ts`

## 📝 Naming Convention

- **Files**: Must end in `.test.ts` (logic) or `.test.tsx` (components).
- **Descriptions**: Use `describe('ComponentName', ...)` for the top-level block and `test('should ...', ...)` or `it('should ...', ...)` for individual test cases.

## 🧩 Component Tests (Frontend)

Use **React Testing Library** to test how components render and behave.

### Boilerplate

```tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MyComponent } from '../MyComponent';

describe('MyComponent', () => {
    test('renders correctly', () => {
        render(<MyComponent />);
        expect(screen.getByText('Hello World')).toBeInTheDocument();
    });

    test('handles clicks', async () => {
        const user = userEvent.setup();
        const handleClick = jest.fn();
        
        render(<MyComponent onClick={handleClick} />);
        
        await user.click(screen.getByRole('button'));
        expect(handleClick).toHaveBeenCalled();
    });
});
```

### Key Tips
- **User Interactions**: Always use `userEvent.setup()` and `await user.click(...)` / `await user.type(...)`.
- **Async UI**: Use `await screen.findByText(...)` or `await waitFor(() => ...)` if elements appear after an API call or timeout.
- **Forms**: If testing form validation, ensure your form has `noValidate` to bypass browser validation, or use `userEvent` to simulate real typing.

## 🧠 Store/Logic Tests (Backend/Integration)

Use **Jest** to test business logic and state management (Zustand).

### Boilerplate

```ts
import { act } from '@testing-library/react';
import { useMyStore } from '../useMyStore';

// 1. Mock Supabase (if needed)
jest.mock('../../lib/supabase', () => {
    const { createSupabaseMock } = require('../../test/supabaseMock');
    return { supabase: createSupabaseMock() };
});

describe('useMyStore', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Reset store state
        act(() => useMyStore.setState({ count: 0 }));
    });

    test('increments count', () => {
        const { increment } = useMyStore.getState();
        
        act(() => {
            increment();
        });

        expect(useMyStore.getState().count).toBe(1);
    });
});
```

### Key Tips
- **`act()`**: Wrap all state updates (store method calls) in `act(() => { ... })` to ensure React processes the updates.
- **Mocking Supabase**:
  - The project has a helper: `src/test/supabaseMock.ts`.
  - To mock specific returns for a test:
    ```ts
    import { supabase } from '../../lib/supabase';
    const mockSupabase = supabase as any;
    
    mockSupabase.from.mockReturnValue({
        select: jest.fn().mockResolvedValue({ data: [{ id: 1 }] }),
        // ... mock other chains like .eq().single()
    });
    ```

## 🚀 Running Tests

- **Run All Tests**:
  ```bash
  npm test
  ```
- **Run Specific File**:
  ```bash
  npm test MyComponent
  ```
- **Watch Mode** (re-runs on save):
  ```bash
  npx jest --watch
  ```
