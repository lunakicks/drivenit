
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EditProfileModal } from '../EditProfileModal';

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
    motion: {
        div: ({ children, className, ...props }: any) => (
            <div className={className} {...props}>{children}</div>
        ),
    },
    AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe('EditProfileModal', () => {
    const mockOnClose = jest.fn();
    const mockOnSave = jest.fn();
    const initialData = {
        displayName: 'Test User',
        email: 'test@example.com',
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // 1. Tests rendering
    test('renders correctly when open', () => {
        render(
            <EditProfileModal
                isOpen={true}
                onClose={mockOnClose}
                initialData={initialData}
                onSave={mockOnSave}
            />
        );

        expect(screen.getByText('Edit Profile')).toBeInTheDocument();
        expect(screen.getByLabelText('Display Name')).toHaveValue('Test User');
        expect(screen.getByLabelText('Email')).toHaveValue('test@example.com');
        expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument();
    });

    test('does not render when closed', () => {
        render(
            <EditProfileModal
                isOpen={false}
                onClose={mockOnClose}
                initialData={initialData}
                onSave={mockOnSave}
            />
        );

        expect(screen.queryByText('Edit Profile')).not.toBeInTheDocument();
    });

    // 2. Handles user interactions
    test('updates form values when user types', async () => {
        const user = userEvent.setup();
        render(
            <EditProfileModal
                isOpen={true}
                onClose={mockOnClose}
                initialData={initialData}
                onSave={mockOnSave}
            />
        );

        const nameInput = screen.getByLabelText('Display Name');
        const emailInput = screen.getByLabelText('Email');

        await user.clear(nameInput);
        await user.type(nameInput, 'New Name');
        expect(nameInput).toHaveValue('New Name');

        await user.clear(emailInput);
        await user.type(emailInput, 'new@example.com');
        expect(emailInput).toHaveValue('new@example.com');
    });

    // 3. Verifies form validation
    test('shows error when display name is empty', async () => {
        const user = userEvent.setup();
        render(
            <EditProfileModal
                isOpen={true}
                onClose={mockOnClose}
                initialData={initialData}
                onSave={mockOnSave}
            />
        );

        const nameInput = screen.getByLabelText('Display Name');
        await user.clear(nameInput);

        const saveButton = screen.getByRole('button', { name: /save changes/i });
        await user.click(saveButton);

        expect(screen.getByText('Display name is required')).toBeInTheDocument();
        expect(mockOnSave).not.toHaveBeenCalled();
    });

    test('shows error when email is invalid', async () => {
        const user = userEvent.setup();
        render(
            <EditProfileModal
                isOpen={true}
                onClose={mockOnClose}
                initialData={initialData}
                onSave={mockOnSave}
            />
        );

        const emailInput = screen.getByLabelText('Email');
        await user.clear(emailInput);
        await user.type(emailInput, 'invalid-email');

        const saveButton = screen.getByRole('button', { name: /save changes/i });
        await user.click(saveButton);

        expect(screen.getByText('Invalid email format')).toBeInTheDocument();
        expect(mockOnSave).not.toHaveBeenCalled();
    });

    // 4. Mocks API calls
    test('calls onSave with correct data when form is valid', async () => {
        const user = userEvent.setup();
        render(
            <EditProfileModal
                isOpen={true}
                onClose={mockOnClose}
                initialData={initialData}
                onSave={mockOnSave}
            />
        );

        const nameInput = screen.getByLabelText('Display Name');
        await user.clear(nameInput);
        await user.type(nameInput, 'Updated User');

        const saveButton = screen.getByRole('button', { name: /save changes/i });
        await user.click(saveButton);

        expect(mockOnSave).toHaveBeenCalledWith({
            displayName: 'Updated User',
            email: 'test@example.com',
        });

        await waitFor(() => {
            expect(mockOnClose).toHaveBeenCalled();
        });
    });

    // 5. Tests error states
    test('handles API errors gracefully', async () => {
        const user = userEvent.setup();
        mockOnSave.mockRejectedValueOnce(new Error('API Error'));

        render(
            <EditProfileModal
                isOpen={true}
                onClose={mockOnClose}
                initialData={initialData}
                onSave={mockOnSave}
            />
        );

        const saveButton = screen.getByRole('button', { name: /save changes/i });
        await user.click(saveButton);

        expect(await screen.findByText('Failed to update profile. Please try again.')).toBeInTheDocument();
        expect(mockOnClose).not.toHaveBeenCalled();
    });
});
