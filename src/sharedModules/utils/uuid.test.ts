import { isUuid } from '@/sharedModules/utils/uuid';

describe('isUuid', () => {
  it('accepts lowercase UUID v4-shaped ids from Supabase', () => {
    expect(isUuid('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
  });

  it('rejects local placeholder ids used before sync', () => {
    expect(isUuid('project-1710000000000')).toBe(false);
    expect(isUuid('exp-1710000000000')).toBe(false);
    expect(isUuid('hw-1710000000000')).toBe(false);
  });
});
