import { act } from '@testing-library/react';
import { useAuthStore } from '../useAuthStore';
import { createSupabaseMock } from '../../test/supabaseMock';

// Mock the supabase client module
const mockSupabase = createSupabaseMock();
jest.mock('../../lib/supabase', () => ({
    supabase: mockSupabase
}));

describe('useAuthStore', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Reset store state
        act(() => {
            useAuthStore.setState({
                user: null,
                bookmarks: [],
                flags: [],
                wrongAnswers: [],
                loading: true
            });
        });
    });

    describe('checkUser (Session Restoration)', () => {
        it('should handle no session correctly', async () => {
            mockSupabase.auth.getSession.mockResolvedValue({ data: { session: null } });

            await act(async () => {
                await useAuthStore.getState().checkUser();
            });

            const state = useAuthStore.getState();
            expect(state.user).toBeNull();
            expect(state.loading).toBe(false);
        });

        it('should load user and profile data when session exists', async () => {
            const mockUser = { id: 'user-123', email: 'test@example.com' };
            const mockProfile = { id: 'user-123', hearts: 5, xp: 100 };

            mockSupabase.auth.getSession.mockResolvedValue({ data: { session: { user: mockUser } } });

            // Mock profile fetch
            mockSupabase.mocks.select.mockReturnValue({
                eq: jest.fn().mockReturnValue({
                    single: jest.fn().mockResolvedValue({ data: mockProfile })
                })
            });

            // Mock other data fetches (bookmarks, flags, progress) - simplified for this test
            // We need to ensure the chain works for multiple calls
            const mockChain = {
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({ data: mockProfile })
            };
            // Override the default mock for this specific test flow if needed, 
            // but our generic mock might need adjustment to handle different returns for different tables.
            // Let's refine the mock strategy in the test body for granular control.

            // Re-mocking for specific table responses
            mockSupabase.from.mockImplementation((table: string) => {
                if (table === 'profiles') {
                    return {
                        select: () => ({
                            eq: () => ({
                                single: () => Promise.resolve({ data: mockProfile })
                            })
                        })
                    };
                }
                if (table === 'bookmarks') return { select: () => ({ eq: () => Promise.resolve({ data: [] }) }) };
                if (table === 'flags') return { select: () => ({ eq: () => Promise.resolve({ data: [] }) }) };
                if (table === 'user_progress') return { select: () => ({ eq: () => ({ eq: () => Promise.resolve({ data: [] }) }) }) };
                return { select: () => ({ eq: () => Promise.resolve({ data: [] }) }) };
            });

            await act(async () => {
                await useAuthStore.getState().checkUser();
            });

            const state = useAuthStore.getState();
            expect(state.user).toEqual(expect.objectContaining({
                id: 'user-123',
                hearts: 5,
                xp: 100
            }));
            expect(state.loading).toBe(false);
        });
    });

    describe('signOut', () => {
        it('should clear user state on sign out', async () => {
            // Set initial state
            useAuthStore.setState({ user: { id: '123' } as any });

            await act(async () => {
                await useAuthStore.getState().signOut();
            });

            const state = useAuthStore.getState();
            expect(state.user).toBeNull();
            expect(state.bookmarks).toEqual([]);
            expect(mockSupabase.auth.signOut).toHaveBeenCalled();
        });
    });

    describe('Database Interactions', () => {
        it('updateHearts should update state and call DB', async () => {
            const mockUser = { id: 'user-123', hearts: 3 };
            useAuthStore.setState({ user: mockUser as any });

            mockSupabase.from.mockReturnValue({
                update: jest.fn().mockReturnValue({
                    eq: jest.fn().mockResolvedValue({ error: null })
                })
            });

            await act(async () => {
                await useAuthStore.getState().updateHearts(1);
            });

            const state = useAuthStore.getState();
            expect(state.user?.hearts).toBe(4);

            // Verify DB call
            expect(mockSupabase.from).toHaveBeenCalledWith('profiles');
        });

        it('updateHearts should clamp values between 0 and 5', async () => {
            const mockUser = { id: 'user-123', hearts: 5 };
            useAuthStore.setState({ user: mockUser as any });

            await act(async () => {
                await useAuthStore.getState().updateHearts(1);
            });

            expect(useAuthStore.getState().user?.hearts).toBe(5); // Max 5

            await act(async () => {
                await useAuthStore.getState().updateHearts(-10);
            });

            expect(useAuthStore.getState().user?.hearts).toBe(0); // Min 0
        });

        it('addXP should update state and call DB', async () => {
            const mockUser = { id: 'user-123', xp: 100 };
            useAuthStore.setState({ user: mockUser as any });

            mockSupabase.from.mockReturnValue({
                update: jest.fn().mockReturnValue({
                    eq: jest.fn().mockResolvedValue({ error: null })
                })
            });

            await act(async () => {
                await useAuthStore.getState().addXP(50);
            });

            const state = useAuthStore.getState();
            expect(state.user?.xp).toBe(150);
        });
    });

    describe('Error Handling', () => {
        it('should handle DB errors gracefully during updates', async () => {
            const mockUser = { id: 'user-123', hearts: 3 };
            useAuthStore.setState({ user: mockUser as any });
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

            mockSupabase.from.mockReturnValue({
                update: jest.fn().mockReturnValue({
                    eq: jest.fn().mockResolvedValue({ error: { message: 'DB Error' } })
                })
            });

            await act(async () => {
                await useAuthStore.getState().updateHearts(1);
            });

            // State should still update optimistically
            expect(useAuthStore.getState().user?.hearts).toBe(4);
            // Error should be logged
            expect(consoleSpy).toHaveBeenCalledWith('Error updating hearts:', expect.anything());

            consoleSpy.mockRestore();
        });
    });
});
