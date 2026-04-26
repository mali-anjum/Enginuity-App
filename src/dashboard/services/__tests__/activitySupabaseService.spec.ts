import { fetchActivityLogsForUser } from '@/dashboard/services/activitySupabaseService';

jest.mock('@/sharedModules/services/supabase/supabaseUntypedClient', () => ({
  unwrapSupabaseClient: (client: unknown) => client,
}));

type QueryResult = { data: unknown; error: { message: string } | null };

function makeActivityClient(result: QueryResult) {
  const query = {
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockResolvedValue(result),
  };

  return {
    from: jest.fn().mockReturnValue(query),
  };
}

describe('activitySupabaseService', () => {
  it('maps action + metadata rows to UI activity items', async () => {
    const client = makeActivityClient({
      data: [
        {
          id: 'a1',
          entity_id: 'exp-1',
          entity_type: 'experiments',
          action: 'create_experiment',
          metadata: { description: 'Experiment started' },
          created_at: '2026-01-01T00:00:00.000Z',
        },
      ],
      error: null,
    });

    const items = await fetchActivityLogsForUser(client as never, 'user-1', 30);

    expect(items).toEqual([
      {
        id: 'a1',
        entityType: 'experiment',
        entityId: 'exp-1',
        eventType: 'experiment_created',
        description: 'Experiment started',
        createdAt: '2026-01-01T00:00:00.000Z',
      },
    ]);
  });

  it('falls back to default description and unknown event', async () => {
    const client = makeActivityClient({
      data: [
        {
          id: 'a2',
          entity_id: null,
          entity_type: 'mystery',
          action: 'some_new_event',
          metadata: null,
          created_at: '2026-01-02T00:00:00.000Z',
        },
      ],
      error: null,
    });

    const items = await fetchActivityLogsForUser(client as never, 'user-1', 30);
    expect(items[0].eventType).toBe('unknown');
    expect(items[0].entityType).toBe('unknown');
    expect(items[0].description).toBe('Activity recorded');
  });

  it('throws when Supabase returns an error', async () => {
    const client = makeActivityClient({
      data: null,
      error: { message: 'boom' },
    });

    await expect(fetchActivityLogsForUser(client as never, 'user-1', 30)).rejects.toThrow('boom');
  });
});
