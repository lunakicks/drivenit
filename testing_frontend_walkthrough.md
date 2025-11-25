# Testing Walkthrough

This guide explains how to run the tests for the User Profile component and provides an overview of the testing setup.

## 🚀 Running Tests

To run the tests, open your terminal and run:

```bash
npm test
```

This will start Jest in watch mode. It will look for files ending in `.test.tsx` or `.spec.tsx` and run them.

### Other Commands

- **Run once (no watch):** `npx jest`
- **Run specific file:** `npx jest EditProfileModal`
- **Show coverage:** `npx jest --coverage`

## 🧪 Test Setup

We are using **Jest** as the test runner and **React Testing Library** for rendering components and simulating user interactions.

- **`jest.config.ts`**: Configures Jest to handle TypeScript and map CSS modules.
- **`jest.setup.ts`**: Extends Jest with `jest-dom` matchers (like `toBeInTheDocument`).
- **`src/components/profile/__tests__/`**: Directory where test files are located.

## 📝 Test Cases Covered

The `EditProfileModal.test.tsx` file covers the following scenarios:

1.  **Rendering:**
    - Verifies the modal renders when `isOpen` is true.
    - Checks that input fields are pre-filled with initial data.
    - Ensures the modal is hidden when `isOpen` is false.

2.  **User Interactions:**
    - Simulates typing in the "Display Name" and "Email" fields.
    - Verifies that the input values update correctly.

3.  **Form Validation:**
    - **Required Fields:** Checks that an error is shown if "Display Name" is cleared.
    - **Format Validation:** Checks that an error is shown if the email format is invalid.
    - Ensures `onSave` is NOT called when validation fails.

4.  **API Mocking:**
    - Mocks the `onSave` function.
    - Verifies that `onSave` is called with the updated data when the form is valid.
    - Checks that `onClose` is called after a successful save.

5.  **Error Handling:**
    - Simulates an API error (promise rejection) from `onSave`.
    - Verifies that an error message is displayed to the user.
    - Ensures the modal remains open so the user can try again.

## 💡 Best Practices Used

- **`userEvent`**: Used instead of `fireEvent` for more realistic user interactions.
- **`screen`**: Used to query elements by accessible roles (e.g., `getByRole`, `getByLabelText`).
- **Mocking**: External dependencies like `framer-motion` are mocked to prevent animation-related issues in tests.
- **Async Testing**: Used `waitFor` and `findBy` to handle asynchronous state updates.
