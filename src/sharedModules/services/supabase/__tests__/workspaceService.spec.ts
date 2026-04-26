import { fetchAccessibleWorkspaceIds, getPersonalWorkspaceId } from '@/sharedModules/services/supabase/workspaceService';

type StepResult = { data: unknown; error: { message: string } | null };

function makeTableQuery(result: StepResult) {
  return {
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockResolvedValue(result),
    insert: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue(result),
    upsert: jest.fn().mockResolvedValue(result),
  };
}

describe('workspaceService', () => {
  it('returns existing personal workspace id when present', async () => {
    const usersQuery = makeTableQuery({ data: null, error: null });
    const workspacesQuery = makeTableQuery({ data: [{ id: 'ws-existing' }], error: null });
    const membersQuery = makeTableQuery({ data: null, error: null });

    const client = {
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: { id: 'user-1', email: 'u@example.com', user_metadata: {} } },
          error: null,
        }),
      },
      from: jest.fn((table: string) => {
        if (table === 'users') return usersQuery;
        if (table === 'workspaces') return workspacesQuery;
        if (table === 'workspace_members') return membersQuery;
        throw new Error(`Unexpected table ${table}`);
      }),
    };

    const id = await getPersonalWorkspaceId(client as never, 'user-1');
    expect(id).toBe('ws-existing');
    expect(workspacesQuery.insert).not.toHaveBeenCalled();
  });

  it('creates workspace + membership when none exists', async () => {
    const usersQuery = makeTableQuery({ data: null, error: null });
    const workspacesQuery = makeTableQuery({ data: [], error: null });
    workspacesQuery.single = jest.fn().mockResolvedValue({ data: { id: 'ws-new' }, error: null });
    const membersQuery = makeTableQuery({ data: null, error: null });

    const client = {
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: { id: 'user-2', email: 'two@example.com', user_metadata: {} } },
          error: null,
        }),
      },
      from: jest.fn((table: string) => {
        if (table === 'users') return usersQuery;
        if (table === 'workspaces') return workspacesQuery;
        if (table === 'workspace_members') return membersQuery;
        throw new Error(`Unexpected table ${table}`);
      }),
    };

    const id = await getPersonalWorkspaceId(client as never, 'user-2');

    expect(id).toBe('ws-new');
    expect(workspacesQuery.insert).toHaveBeenCalled();
    expect(membersQuery.upsert).toHaveBeenCalledWith(
      { workspace_id: 'ws-new', user_id: 'user-2', role: 'admin' },
      { onConflict: 'workspace_id,user_id' },
    );
  });

  it('fetchAccessibleWorkspaceIds returns array of ids', async () => {
    const membersQuery = makeTableQuery({
      data: [{ workspace_id: 'ws-1' }, { workspace_id: 'ws-2' }],
      error: null,
    });
    membersQuery.eq = jest
      .fn()
      .mockResolvedValue({ data: [{ workspace_id: 'ws-1' }, { workspace_id: 'ws-2' }], error: null });

    const client = {
      from: jest.fn().mockReturnValue(membersQuery),
    };

    const ids = await fetchAccessibleWorkspaceIds(client as never, 'user-1');
    expect(ids).toEqual(['ws-1', 'ws-2']);
  });
});
