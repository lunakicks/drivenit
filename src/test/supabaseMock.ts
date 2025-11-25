export const createSupabaseMock = () => {
    const mockSelect = jest.fn();
    const mockInsert = jest.fn();
    const mockUpdate = jest.fn();
    const mockDelete = jest.fn();
    const mockUpsert = jest.fn();
    const mockEq = jest.fn();
    const mockSingle = jest.fn();

    // Chainable mock implementation
    const queryBuilder = {
        select: mockSelect,
        insert: mockInsert,
        update: mockUpdate,
        delete: mockDelete,
        upsert: mockUpsert,
        eq: mockEq,
        single: mockSingle,
    };

    // Default return values for chaining
    mockSelect.mockReturnValue(queryBuilder);
    mockInsert.mockReturnValue(queryBuilder);
    mockUpdate.mockReturnValue(queryBuilder);
    mockDelete.mockReturnValue(queryBuilder);
    mockUpsert.mockReturnValue(queryBuilder);
    mockEq.mockReturnValue(queryBuilder);
    mockSingle.mockReturnValue(queryBuilder);

    return {
        auth: {
            getSession: jest.fn(),
            signOut: jest.fn(),
            onAuthStateChange: jest.fn().mockReturnValue({ data: { subscription: { unsubscribe: jest.fn() } } }),
        },
        from: jest.fn().mockReturnValue(queryBuilder),
        // Expose mocks for assertions
        mocks: {
            select: mockSelect,
            insert: mockInsert,
            update: mockUpdate,
            delete: mockDelete,
            upsert: mockUpsert,
            eq: mockEq,
            single: mockSingle,
        }
    };
};
